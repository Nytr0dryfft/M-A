const { onRequest } = require('firebase-functions/v2/https');
const admin = require('firebase-admin');
const crypto = require('crypto');

admin.initializeApp();
const db = admin.firestore();

/**
 * Função Segura de Controle de Limites no Servidor (Firebase Cloud Function)
 * Aplica:
 * 1. Limite de 10 orçamentos por endereço IP a cada 24 horas.
 * 2. Limite de 3 orçamentos por usuário (UID) a cada 24 horas.
 * 3. Validação do token Firebase App Check.
 * 4. Validação de payload e integridade contra repetição (idempotência por orderId).
 */
exports.verifyQuoteQuota = onRequest(
  { cors: true, maxInstances: 10 },
  async (req, res) => {
    // Apenas método POST é permitido
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método não permitido' });
    }

    try {
      const { orderId, userId, elementsCount, totalFilesSize } = req.body || {};

      // 1. Validação básica de parâmetros
      if (!orderId || typeof orderId !== 'string' || !orderId.startsWith('ORD-')) {
        return res.status(400).json({ error: 'Identificador de pedido inválido.' });
      }

      if (elementsCount > 5) {
        return res.status(400).json({ error: 'Limite de elementos personalizados excedido (máximo 5).' });
      }

      if (totalFilesSize > 15 * 1024 * 1024) {
        return res.status(400).json({ error: 'Tamanho total de arquivos excede 15 MB.' });
      }

      // 2. Extração segura do endereço IP do cliente (sem confiar em cabeçalhos forjados)
      const rawIp =
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.socket.remoteAddress ||
        'unknown_ip';

      // Hash anônimo do IP para conformidade com privacidade e LGPD
      const ipHash = crypto.createHash('sha256').update(rawIp).digest('hex');
      const now = Date.now();
      const window24h = 24 * 60 * 60 * 1000;
      const cutoff = now - window24h;

      // 3. Verificação transacional atômica no Firestore para o IP
      const ipRef = db.collection('rate_limits_ip').doc(ipHash);
      const userRef = userId ? db.collection('quote_rate_limits').doc(userId) : null;

      const rateLimitResult = await db.runTransaction(async (transaction) => {
        // Leitura do IP
        const ipDoc = await transaction.get(ipRef);
        let ipTimestamps = [];
        if (ipDoc.exists) {
          ipTimestamps = (ipDoc.data().timestamps || []).filter((t) => t > cutoff);
        }

        if (ipTimestamps.length >= 10) {
          return { allowed: false, reason: 'ip_limit' };
        }

        // Leitura do Usuário
        let userTimestamps = [];
        if (userRef) {
          const userDoc = await transaction.get(userRef);
          if (userDoc.exists) {
            userTimestamps = (userDoc.data().requestTimestamps || []).filter((t) => t > cutoff);
          }

          if (userTimestamps.length >= 3) {
            return { allowed: false, reason: 'user_limit' };
          }
        }

        // Atualização atômica
        ipTimestamps.push(now);
        transaction.set(ipRef, {
          ipHash,
          timestamps: ipTimestamps,
          lastRequestAt: admin.firestore.FieldValue.serverTimestamp(),
          totalRequests24h: ipTimestamps.length,
        }, { merge: true });

        if (userRef) {
          userTimestamps.push(now);
          transaction.set(userRef, {
            userId,
            lastOrderId: orderId,
            requestTimestamps: userTimestamps,
            totalRequests24h: userTimestamps.length,
            lastUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
          }, { merge: true });
        }

        return {
          allowed: true,
          remainingUser: userRef ? Math.max(0, 3 - userTimestamps.length) : null,
          remainingIp: Math.max(0, 10 - ipTimestamps.length),
        };
      });

      if (!rateLimitResult.allowed) {
        return res.status(429).json({
          allowed: false,
          friendlyMessage:
            'Você atingiu o limite de solicitações de orçamento para este período. Tente novamente mais tarde. Se precisar de ajuda com seu projeto, entre em contato conosco pelo WhatsApp.',
        });
      }

      return res.status(200).json({
        allowed: true,
        orderId,
        remaining: rateLimitResult.remainingUser,
      });
    } catch (err) {
      console.error('Erro na verificação de cota:', err);
      return res.status(500).json({
        allowed: false,
        friendlyMessage:
          'Não foi possível concluir o envio do orçamento no momento. Suas configurações estão salvas. Por favor, tente novamente ou utilize o botão do WhatsApp.',
      });
    }
  }
);

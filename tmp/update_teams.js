const fs = require('fs');

let content = fs.readFileSync('src/data/teams.ts', 'utf8');

const regex = /id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*shortName:\s*'([^']+)',\s*category:\s*'([^']+)',\s*categoryLabel:\s*'([^']+)',\s*imageUrl:\s*'([^']+)',/g;

content = content.replace(regex, (match, id, name, shortName, category, categoryLabel, imageUrl) => {
  const displayLogo = id === 'flamengo' ? '/clubs/flamengo/logo.svg' : imageUrl;
  const cncArtwork = `/clubs/${id}/cnc.svg`;
  return `id: '${id}',\n    name: '${name}',\n    shortName: '${shortName}',\n    category: '${category}',\n    categoryLabel: '${categoryLabel}',\n    displayLogo: '${displayLogo}',\n    cncArtwork: '${cncArtwork}',\n    imageUrl: '${displayLogo}',`;
});

fs.writeFileSync('src/data/teams.ts', content, 'utf8');
console.log('src/data/teams.ts updated successfully');

function deserializeChunks(serializedChunks) {
    if (Array.isArray(serializedChunks)) {
    const binaryChunks = [];
    for (const base64Data of serializedChunks) {
        const binaryData = Buffer.from(base64Data, 'base64');
        binaryChunks.push(binaryData);
    }
    return binaryChunks;
}
  const binaryData = Buffer.from(serializedChunks, 'base64');
  return binaryData
}

module.exports = deserializeChunks
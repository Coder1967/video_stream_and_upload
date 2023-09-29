const path = require('path');

function getVideoMimeType(filename) {
  const extension = path.extname(filename).toLowerCase();
  switch (extension) {
    case '.mp4':
      return 'video/mp4';
    case '.webm':
      return 'video/webm';
    case '.ogg':
      return 'video/ogg';
    case '.flv':
      return 'video/x-flv';
    case '.mov':
      return 'video/quicktime';
    case '.wmv':
      return 'video/x-ms-wmv';
    case '.avi':
      return 'video/x-msvideo';
    case '.mkv':
      return 'video/x-matroska';
    case '.3gp':
      return 'video/3gpp';
    case '.3g2':
      return 'video/3gpp2';
    default:
      return null
  }
}

module.exports = getVideoMimeType

const commands = ["/start", "/site", "/test"];
module.exports = function isCommand(text) {
  if (commands.includes(text)) {
    return true;
  }
  return false;
};

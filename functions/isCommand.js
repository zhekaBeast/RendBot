const commands = ["/start", "/site"];
module.exports = function isCommand(text) {
  if (commands.includes(text)) {
    return true;
  }
  return false;
};

function transformer(file, api) {
  let { source } = file;

  source = source.replace(/20\d\d/g, '2019');

  return source;
}

module.exports = transformer;

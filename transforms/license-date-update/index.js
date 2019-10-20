export default function transformer(file) {
  const date = new Date();
  const year = date.getFullYear();
  let { source } = file;

  source = source.replace(/20\d\d/g, year);

  return source;
}

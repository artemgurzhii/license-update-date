const DATE_REGEXP = /20\d\d/g;
const DATE_WITH_DATE_REGEXP = /(20\d\d)-(20\d\d)/g;

export default function transformer(file) {
  const date = new Date();
  const currentYear = date.getFullYear();
  let { source } = file;

  if (source.includes(`${currentYear}`)) return source;

  if (source.match(DATE_WITH_DATE_REGEXP)) {
    source = source.replace(DATE_WITH_DATE_REGEXP, (_str, match1 /*, _match2 */) => {
      return `${match1}-${currentYear}`;
    });
  } else {
    source = source.replace(DATE_REGEXP, currentYear);
  }

  return source;
}

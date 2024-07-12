export const createList = (items: string[]): string => {
  const list = items.map((issue) => `<li><a href="${issue}">${issue}</a></li>`);
  return `<ul>${list.join("")}</ul>`;
};

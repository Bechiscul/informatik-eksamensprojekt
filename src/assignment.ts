import { jsPDF as PDF, jsPDFAPI } from "jspdf";
import { Chance } from "chance";

const CHANCE = new Chance();

import { Assignment, Task } from "./App";

export type DocumentOptions = {
  margin: [number, number];
  shuffle: boolean;
};

const getDocumentOptions = (
  document: PDF,
  options?: Partial<DocumentOptions>
) => {
  const { pageSize } = document.internal;

  const DEFAULT_DOCUMENT_OPTIONS: DocumentOptions = {
    margin: [15, 25],
    shuffle: false,
  };

  const all = { ...DEFAULT_DOCUMENT_OPTIONS, ...options };

  return {
    getPageWidth: pageSize.getWidth,
    getPageHeight: pageSize.getHeight,
    getLineHeight: document.getLineHeight,
    getLineWidth: () => pageSize.getWidth() - 2 * all.margin[0],
    getMarginX: () => all.margin[0],
    getMarginY: () => all.margin[1],
    allOptions: all,
  };
};

const convertPtToPx = (x: number) => x * (72 / 96);

const generateTitlePage = (
  document: PDF,
  options: DocumentOptions,
  title: string
): PDF => {
  const { getLineWidth, getPageWidth, getMarginY, getLineHeight } =
    getDocumentOptions(document, options);

  const previousFontSize = document.getFontSize();
  document.setFontSize(32);

  document.insertPage(1);
  document.text(title, getPageWidth() / 2, getMarginY() + 1 * getLineHeight(), {
    align: "center",
    maxWidth: getLineWidth(),
  });

  document.setFontSize(previousFontSize);
  return document;
};

const generateTaskPage = (
  document: PDF,
  options: DocumentOptions,
  task: Task
): PDF => {
  const { getLineWidth, getPageWidth, getMarginX, getMarginY, getLineHeight } =
    getDocumentOptions(document, options);
  const { title, body, questions } = task;

  let y = getMarginY();

  const previousFontSize = document.getFontSize();
  document.setFontSize(24);

  document.addPage("a4");
  document.text(title, getMarginX(), y, {
    maxWidth: getLineWidth(),
  });

  y += document.getTextDimensions(title, {
    maxWidth: getLineWidth(),
  }).h;

  document.setFontSize(12);
  document.text(body, getMarginX(), y, {
    maxWidth: getLineWidth(),
  });

  y += document.getTextDimensions(body, { maxWidth: getLineWidth() }).h;

  // Empty line before questions
  y += convertPtToPx(getLineHeight());

  for (const rawQuestion of questions) {
    const question = generateQuestion(rawQuestion);
    document.text(question, getMarginX(), y, { maxWidth: getLineWidth() });
    y += document.getTextDimensions(question, { maxWidth: getLineWidth() }).h;
  }

  document.setFontSize(previousFontSize);
  return document;
};

export const generateDocument = (
  assignment: Assignment,
  options?: Partial<DocumentOptions>
): PDF => {
  let document = new PDF();
  const { allOptions } = getDocumentOptions(document, options);

  const { title, tasks } = assignment;
  generateTitlePage(document, allOptions, title);

  for (const task of tasks) {
    generateTaskPage(document, allOptions, task);
  }

  // Shuffle pages
  if (allOptions.shuffle) {
    const pages = document.getNumberOfPages();
    console.log(pages);

    for (let i = 3; i <= pages; i++) {
      const before = Math.floor(Math.random() * (pages - 2));
      document.movePage(i, before + 3);
    }
  }

  return document;
};

/// An expression is everything that is contained between a pair of `\[` and `]\`.
/// Returns an array containing two numbers representing a range into `s`
const findExpressions = (s: string): [number, number][] => {
  let expressions: [number, number][] = [];

  let i = 0;
  while (i < s.length && s.indexOf("\\[", i) !== -1) {
    const start = s.indexOf("\\[", i);
    const end = s.indexOf("]\\", start);

    if (end === -1) throw Error("Unable to locate end-expression sequence.");

    expressions.push([start + "\\[".length, end]);
    i = end + "]\\".length;
  }

  return expressions;
};

export const generateQuestion = (question: string): string => {
  const expressions = findExpressions(question);

  let generated = question;
  for (const [startExpression, endExpression] of expressions) {
    const expression = question.slice(startExpression, endExpression);
    const isRangeExpression = expression.indexOf("..") !== -1;
    const isListExpression = expression.includes(",");

    let value = "";
    if (expression.length !== 0) {
      if (isRangeExpression && isListExpression) {
        throw new Error(`Ambiguous expression. Found both '..' and ','`);
      } else if (isRangeExpression) {
        const start = expression.slice(0, expression.indexOf(".."));
        const end = expression.slice(expression.indexOf("..") + "..".length);

        const modifiers = findModifiers(start.slice(0, 5));
        const startWithoutModifiers = start.slice(modifiers.amount);

        const min = Number.parseFloat(startWithoutModifiers);
        const max = Number.parseFloat(end);
        if (min > max)
          throw new Error("start of range must be less than end of range");

        const x =
          Math.round(randomValueFromRange([min, max], modifiers) * 100) / 100;

        value = Number.isInteger(x) ? x.toString() : x.toFixed(2);
      } else if (isListExpression) {
        const list = expression.split(",").map((v) => parseFloat(v));
        const i = Math.floor(Math.random() * list.length);
        value = list[i].toString();
      }
    }

    const from = generated.indexOf("\\[");
    const to = generated.indexOf("]\\");
    generated = generated.slice(0, from) + value + generated.slice(to + 2);
  }

  return generated;
};

type Modifiers = {
  amount: number;
  n: boolean;
  z: boolean;
  q: boolean;
  r: boolean;
};

const findModifiers = (s: string): Modifiers => {
  return {
    amount: s.match(/N|Z|Q|R/gi)?.length || 0,
    n: s.match(/N/i) !== null,
    z: s.match(/Z/i) !== null,
    q: s.match(/Q/i) !== null,
    r: s.match(/R/i) !== null,
  };
};

const randomValueFromRange = (
  range: [number, number],
  modifiers: Modifiers
): number => {
  if (modifiers.amount === 0)
    modifiers = { amount: 2, n: true, z: true, q: false, r: false };

  const [min, max] = range;
  const { n, z, q } = modifiers;
  if (n && z && q) {
    // Generate a random number than can be negative. can be positive and or can be fractional.
    return Math.random() * (max - min) + min;
  } else if (n && z) {
    // Generate a random whole number than can be negative or positive.
    return CHANCE.integer({ min, max });
  } else if (n && !z) {
    // Generate a random whole number that can only be positive.
    if (range[0] < 0 || range[1]) throw new Error("Only natural numbers");
    return CHANCE.integer({ min, max });
  }

  throw new Error("Unchecked");
};

export {};

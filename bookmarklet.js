// TLTXT: Bookmarklet to copy text into tldraw.com boards
// ======================================================
//
// https://www.tldraw.com/
//
// https://chimurai.github.io/bookmarklet/

const START_POS_X = 200;
const START_POS_Y = 100;
const SPACE_X = 35;
const SPACE_Y = 120;
const TEXT_MAX_CHAR_WIDTH = 60;
const TEXT_SIZE_STYLE = 'm';

function reflow_text(text, max_width, add_blanks = false) {
  // Split the text into paragraphs
  const paragraphs = text.split(/\n\s*\n/);

  // Process each paragraph
  const processed_paragraphs = paragraphs.map(paragraph => {
    const words = paragraph.split(/\s+/);
    const lines = [];
    let current_line = '';
    let current_width = 0;

    for (const word of words) {
      const word_width = word.length;

      if (current_width + word_width + 1 > max_width) {
        lines.push(current_line.trim());
        current_line = word;
        current_width = word_width;
      } else {
        if (current_line !== '') {
          current_line += ' ';
          current_width++;
        }
        current_line += word;
        current_width += word_width;
      }
    }

    if (current_line !== '') {
      lines.push(current_line.trim());
    }

    return lines.join('\n');
  });

  let ret_text = "";

  if (add_blanks) {
    // Join the processed paragraphs with a blank line between them
    ret_text = processed_paragraphs.join('\n\n');
  } else {
    ret_text = processed_paragraphs.join('\n');
  }

  return ret_text;
}

function tldraw_text_inject(text) {
  // Check if tldraw app is available
  if (!window.app) {
    alert("TLDRAW app not found. Please make sure you're on the tldraw.com website.");
    return;
  }

  const app = window.app;

  const lines = reflow_text(text, TEXT_MAX_CHAR_WIDTH).split("\n");

  var cur_x = START_POS_X;
  var cur_y = START_POS_Y;

  var date_now = `${Date.now()}`;

  lines.forEach(function (line, line_idx) {
    var words = line.split(/\s+/);
    var shape_id = "";

    words.forEach(function (word, word_idx) {

      shape_id = "shape:text-" + date_now + "_" + line_idx + "_" + word_idx;

      shape = app.createShape({
        type: "text",
        id: shape_id,
        x: cur_x,
        y: cur_y,
        props: {
          text: word,
          size: TEXT_SIZE_STYLE, // DefaultSizeStyle: 'l' | 'm' | 's' | 'xl'
          color: 'white', // DefaultColorStyle
          font: 'serif', // DefaultFontStyle: 'draw' | 'mono' | 'sans' | 'serif'
          textAlign: 'start', // DefaultTextAlignStyle: 'end' | 'middle' | 'start'
        },
      });

      cur_x = window.editor.getShapePageBounds(shape_id).maxX + SPACE_X;

    });

    cur_x = START_POS_X;
    cur_y = window.editor.getShapePageBounds(shape_id).maxY + SPACE_Y;

  });
}

navigator.clipboard
    .readText()
    .then((text) => tldraw_text_inject(text));

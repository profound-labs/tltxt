// TLTXT: Bookmarklet to copy text into tldraw.com boards
// ======================================================
//
// https://www.tldraw.com/
//
// https://chimurai.github.io/bookmarklet/

var START_POS_X = 200;
var START_POS_Y = 100;
var SPACE_X = 35;
var SPACE_Y = 120;
var WRAP_TEXT = true;
var TEXT_MAX_CHAR_WIDTH = 60;
var TEXT_COLOR = 'white';
var TEXT_SIZE_STYLE = 'm';
var ADD_BLANK_LINES = false;
var INSERT_TEXT = '';

function reflow_text(text, max_width, add_blank_lines = false) {
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

  if (add_blank_lines) {
    // Join the processed paragraphs with a blank line between them
    ret_text = processed_paragraphs.join('\n\n');
  } else {
    ret_text = processed_paragraphs.join('\n');
  }

  return ret_text;
}

function tldraw_text_insert(text) {
  // Check if tldraw app is available
  if (!window.app) {
    alert("TLDRAW app not found. Please make sure you're on the tldraw.com website.");
    return;
  }

  const app = window.app;

  var lines = [];

  if (WRAP_TEXT) {
    lines = reflow_text(text, TEXT_MAX_CHAR_WIDTH, ADD_BLANK_LINES).split("\n");
  } else {
    lines = text.split("\n");
  }

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
          color: TEXT_COLOR, // DefaultColorStyle
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

function create_modal() {
  var modal = document.createElement('div');
  modal.innerHTML = `
      <style>
        #tltxt-modal {
          display: none;
          position: fixed;
          z-index: 9999;
          left: 0;
          top: 0;
          width: 100%;
          height: 100%;
          overflow: auto;
          background-color: rgba(0,0,0,0.4);
        }
        .modal-content {
          background-color: #fefefe;
          margin: 20px auto;
          padding: 0;
          border: 1px solid #888;
          width: 80%;
          max-width: 600px;
          border-radius: 10px;
          box-shadow: 0 4px 8px rgba(0,0,0,0.1);
        }
        .modal-header {
          background-color: #007A50;
          color: white;
          padding: 0 0 10px 0;
          text-align: center;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
        }
        .modal-body {
          padding: 20px;
        }
        .modal-footer {
          background-color: #e5e5e5;
          padding: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom-left-radius: 10px;
          border-bottom-right-radius: 10px;
        }
        button {
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
        }
        #okButton {
          background-color: #409614;
          color: white;
        }
        #cancelButton {
          background-color: #D93526;
          color: white;
          margin-left: 10px;
        }

        /* Two-columns layout */
        .two-columns {
          display: flex;
          justify-content: space-between;
        }
        .column {
          flex-basis: 45%;
        }
        label {
          display: block;
          margin-bottom: 5px;
        }
        input[type="number"], select {
          width: 100%;
          margin-bottom: 10px;
        }
        textarea {
          width: 100%;
          margin-top: 10px;
        }
        @media screen and (max-width: 768px) {
          .two-columns {
            flex-direction: column;
          }
          .column {
            flex-basis: 100%;
            margin-bottom: 10px;
          }
        }
      </style>
      <div id="tltxt-modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2>TLTXT Settings</h2>
          </div>
          <div class="modal-body">
            <div class="two-columns">
              <div class="column">
                <label for="start_pos_x">Start at position X:</label>
                <input type="number" id="start_pos_x" value="${START_POS_X || 0}">

                <label for="start_pos_y">Start at position Y:</label>
                <input type="number" id="start_pos_y" value="${START_POS_Y || 0}">

                <label for="space_x">Word spacing (px):</label>
                <input type="number" id="space_x" value="${SPACE_X || 0}">

                <label for="space_y">Line spacing (px):</label>
                <input type="number" id="space_y" value="${SPACE_Y || 0}">
              </div>

              <div class="column">
                <label for="wrap_text">Wrap text:</label>
                <input type="checkbox" id="wrap_text" checked>

                <label for="text_max_char_width">Text wrap characters width:</label>
                <input type="number" id="text_max_char_width" value="${TEXT_MAX_CHAR_WIDTH || 0}">

                <label for="add_blank_lines">Add blank lines:</label>
                <input type="checkbox" id="add_blank_lines">

                <label for="text_color">Text color:</label>
                <select id="text_color">
                  <option value="white" selected>White</option>
                  <option value="black">Black</option>
                </select>

                <label for="text_size_style">Text size:</label>
                <select id="text_size_style">
                  <option value="l">Large</option>
                  <option value="m" selected>Medium</option>
                  <option value="s">Small</option>
                  <option value="xl">Extra Large</option>
                </select>
              </div>
            </div>

            <label for="insert_text">Text to insert:</label><br>
            <textarea id="insert_text" rows="10" cols="40">${INSERT_TEXT || 0}</textarea>
          </div>
          <div class="modal-footer">
            <button id="cancelButton">Cancel</button>
            <button id="okButton">OK</button>
          </div>
        </div>
      </div>
    `;

  document.body.appendChild(modal);

  modal.querySelector('#okButton').addEventListener('click', set_tltxt_values);
  modal.querySelector('#cancelButton').addEventListener('click', close_modal);

  return modal.querySelector('#tltxt-modal');
}

function close_modal() {
  var modal = document.getElementById('tltxt-modal');
  modal.style.display = 'none';
}

function set_tltxt_values() {
  START_POS_X = Number(document.getElementById('start_pos_x').value);
  START_POS_Y = Number(document.getElementById('start_pos_y').value);
  SPACE_X = Number(document.getElementById('space_x').value);
  SPACE_Y = Number(document.getElementById('space_y').value);
  WRAP_TEXT = document.getElementById('wrap_text').checked;
  TEXT_MAX_CHAR_WIDTH = Number(document.getElementById('text_max_char_width').value);

  TEXT_SIZE_STYLE = document.getElementById('text_size_style').value;
  TEXT_COLOR = document.getElementById('text_color').value;
  ADD_BLANK_LINES = document.getElementById('add_blank_lines').checked;
  INSERT_TEXT = document.getElementById('insert_text').value;

  close_modal();
  tldraw_text_insert(INSERT_TEXT);
}

function open_modal() {
  var modal = document.getElementById('tltxt-modal');
  if (!modal) {
    modal = create_modal();
  }
  modal.style.display = 'block';
}

navigator.clipboard
    .readText()
    .then((text) => {
      INSERT_TEXT = text;
      open_modal();
    });

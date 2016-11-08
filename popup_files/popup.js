
/**
 * At the very bottom of this JS file, we'll inject a script into the current webpage to extract its HTML. When that is
 * done, this function will be executed. So, here we'll trigger the actual logic of our extension.
 *
 * @param  {object} request request made.
 * @param  {object} sender  who sent the request.
 */
chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    processHtml(request.source);
  }
});



/**
 * We'll search the HTML extracting bold texts to compose a summary.
 *
 * @param  {string} html HTML to process.
 */
function processHtml(html) {
  let chunks = getBoldTextChunks(html);

  // Hide the waiting message
  document.getElementById("wait").style.display = "none";

  if (chunks.length > 0) {

    // I tried using Handlebars, but executing that kinds of things is now forbidden by Chrome.
    let body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML("beforeend", "<ul></ul>");
    let ul = document.getElementsByTagName("ul")[0];

    chunks.forEach(function(chunk) {
      ul.insertAdjacentHTML("beforeend", "<li title=\"" + chunk.context + "\">" + chunk.text + "</li>");
    });
  } else {

    // No bold text to display
    document.getElementById("no-results").style.display = "block";
  }

}



/**
 * Extracts chunks of bold text from an HTML string.
 *
 * @param  {string} html HTML string to extract bold text from.
 * @return {object} an array of chunks. Each chunk will be composed of a "text" property with the bold text itself, a
 * "before" property with the text previous to the bold one in the same sentence and an "after" property with the text
 * posterior to the bold one in the same sentence.
 */
function getBoldTextChunks(html) {

  let chunks = [];

  try {

    // To be able to manipulate the data, we'll inject it into a hidden element of our popup.
    let body = document.getElementsByTagName("body")[0];
    body.insertAdjacentHTML("beforeend", "<div id=\"hidden\" style=\"display: none;\"></div>");
    let hidden = document.getElementById("hidden");
    hidden.insertAdjacentHTML("beforeend", html);

    // Now get the bold elements.
    let main = document.getElementsByTagName("main");
    if (main.length) {
      main = main[0];
    } else {
      main = document;
    }

    let strongs = main.getElementsByTagName("strong");
    strongs = Array.prototype.slice.call(strongs); // Turn HTMLCollection into an array

    let bs = main.getElementsByTagName("b");
    bs = Array.prototype.slice.call(bs); // Turn HTMLCollection into an array

    let bolds = strongs.concat(bs);

    bolds.forEach(function(bold) {
      chunks = processBoldTextChunk(bold, chunks);
    });

    // Delete the hidden element
    body.removeChild(hidden);
  } catch (err) {
  }

  return chunks;
}



/**
 * Given a bold DOM element (either a <strong> or a <b>), extracts the information we're going to display about it.
 * That information is the sentence in which the tag appears with the bold text in bold. But, if the sentence contains
 * more than one bold element, we don't want to have two chunks displayed in the summary. Rather, we'll update the
 * already processed one to include the bold text being processed as well.
 *
 * @param  {HTMLElement} boldElement HTML element to process.
 * @param  {object}      chunks      chunks already considered.
 * @return {object}      chunks already considered.
 */
function processBoldTextChunk(boldElement, chunks) {

    // The bold text might be a part of a sentence. Let's get the whole sentence.
    let text = boldElement.textContent;
    let context = boldElement.parentNode.textContent;
    let startIndex = context.indexOf(text);
    let startContext = context.substring(0, startIndex);
    startIndex = startContext.lastIndexOf(". ");
    let endIndex = context.indexOf(". ", startIndex + text.length);
    endIndex = (endIndex < 0)? context.length - 1 : endIndex;

    let originalText = text;
    text = context.substring(startIndex + 1, endIndex + 1);
    text = text.trim();

    // Make the text... bold!
    let formattedText = text.replace(originalText, "<strong>" + originalText + "</strong>");

    // This is the item we'll include in the array of chunks.
    let chunk = {
      "text": formattedText,
      "plainText": text,
      "context": boldElement.parentNode.textContent
    };

    // The sentence might have alrady been included
    let alreadyIncluded = chunks.find(function(candidateChunk) {
      return candidateChunk.plainText == chunk.plainText;
    });

    if (typeof alreadyIncluded == "undefined") {

      // It wasn't included, so add it
      chunks.push(chunk);
    } else {

      // Highlight this piece of text in the already included chunk
      alreadyIncluded.text = alreadyIncluded.text.replace(originalText, "<strong>" + originalText + "</strong>");
    }

    return chunks;
}



/**
 * Inject a script into the current page to get its HTML.
 */
window.onload = function() {
  chrome.tabs.executeScript(null, {
    file: "popup_files/getPagesSource.js"
  }, function() {
    if (chrome.runtime.lastError) {
      message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
    }
  });
};
# diagonalreader
Chrome extension to summarize a webpage by collecting all its bold texts. 

We inject a script into the current website to read its HTML. Then, on the popup HTML the extension displays, we inject the HTML recovered from the website and then analyze it to obtain bold texts from it. We will look for <code>&lt;strong&gt;</code> and <code>&lt;b&gt;</code> tags within the <code>&lt;main&gt;</code>, if there is a <code>&lt;main&gt;</code>. If there is not, we'll use the whole <code>&lt;body&gt;</code>. 

When we find the bold texts, we'll collect the whole sentences in which they appeared and then display those sentences as a list in the popup.

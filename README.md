# diagonalreader
Chrome extension to summarize a webpage by collecting all its bold texts. 

We inject a script into the current website to read its HTML. Then, on the popup HTML the extension displays, we inject the HTML recovered from the website and then analyze it to obtain bold texts from it. We will look for <strong> and <b> tags within the <main>, if there is a <main>. If there is not, we'll use the whole <body>. 

When we find the bold texts, we'll collect the whole sentences in which they appeared and then display those sentences as a list in the popup.

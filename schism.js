// Functionality to split text, allowing for animation and manipulation
/**
 * @param target: the target string to manipulate
 * @param mutation: chars, words, or lines
 * @default words
 */

export default class schism {
  constructor({
    target = target,
    mutation = "words",
    overflow = "hidden",
    resizeDebounce = 200,
  }) {
    this.target = target;
    this.mutation = mutation;
    this.original = target.cloneNode(true); // Added 'true' to clone child nodes
    this.originalContent = target.innerHTML; // Store original HTML content
    this.overflow = overflow; // hidden or visible
    this.resizeDebounce = resizeDebounce; // Debounce time in ms
    this.resizeTimeout = null;

    this.charArray = [];
    this.charParentArray = [];
    this.wordArray = [];
    this.wordParentArray = [];
    this.lineArray = [];
    this.lineParentArray = [];

    if (!this.target) return;

    if (
      this.mutation !== "chars" &&
      this.mutation !== "words" &&
      this.mutation !== "lines"
    ) {
      console.error(
        "Split needs a mutation. Choose `chars`, `words` or `lines`",
      );
      return;
    }

    // Initialize
    this.split();

    // Add resize event listener
    this.bindResizeHandler();
  }

  split() {
    // Reset arrays
    this.charArray = [];
    this.charParentArray = [];
    this.wordArray = [];
    this.wordParentArray = [];
    this.lineArray = [];
    this.lineParentArray = [];

    // Reset target content to original
    this.target.innerHTML = this.originalContent;

    // initially split into words
    this.splitWords = this.target.innerHTML.split(" ");

    // Create outer span element
    this.outerSpan = document.createElement("span");

    // Set outer span properties
    this.outerSpan.setAttribute("data-split", "outer");
    this.outerSpan.style.display = "inline-block";
    this.outerSpan.style.overflow = "hidden";
    this.outerSpan.style.verticalAlign = "top";
    // this.outerSpan.style.whiteSpace = 'pre'

    // create base inner span
    this.innerSpan = document.createElement("span");

    // set inner span properties
    this.innerSpan.setAttribute("data-split", "inner");
    this.innerSpan.style.display = "inherit";
    this.innerSpan.style.overflow = this.overflow;
    this.innerSpan.style.verticalAlign = "inherit";
    // this.innerSpan.style.whiteSpace = 'inherit'

    this.whitespace = document.createTextNode(" ");

    // Remove target children
    this.target.innerHTML = "";

    this.init();
  }

  init() {
    // make Words first
    // each word is wrapped in the outerspan
    this.splitWords.forEach((w) => {
      const wordInnerSpan = this.innerSpan.cloneNode();
      wordInnerSpan.innerHTML = w;

      const wordOuterSpan = this.outerSpan.cloneNode();
      wordOuterSpan.appendChild(wordInnerSpan);

      this.target.appendChild(wordOuterSpan);
      this.target.append(" ");

      this.wordArray.push(wordInnerSpan);
      this.wordParentArray.push(wordOuterSpan);
    });

    // if mutating to char, grab the word inner span, split the word into chars and replace
    if (this.mutation === "chars") {
      const children = Array.prototype.slice.call(this.target.children);

      // clear the word arrays to stop confusion
      this.wordArray = [];
      this.wordParentArray = [];

      if (children.length > 0) {
        children.forEach((c) => {
          // get the child word of the outer span
          const childNode = c.children[0];
          const splitWord = childNode.innerHTML.split("");

          // remove word node
          c.removeChild(childNode);

          // iterate through each char and inject back into outer span
          splitWord.forEach((s) => {
            // create new span for chars

            const charInnerSpan = this.innerSpan.cloneNode();
            charInnerSpan.innerHTML = s;
            c.appendChild(charInnerSpan);

            this.charArray.push(charInnerSpan);
          });

          this.charParentArray.push(c);
        });
      }
    }

    if (this.mutation === "lines") {
      // Get font size but first we need to
      // check if the dom contains the target
      let fontSize;
      let lineOffset = null;

      if (!document.body.contains(this.target)) {
        // set display to none and allow the window to get computed styles
        this.original.style.display = "none";
        document.body.appendChild(this.original);

        // Get the font size and threshold
        const cs = window.getComputedStyle(this.original, null);
        fontSize = parseFloat(cs.fontSize);

        // Remove child again
        this.original.style.display = "inherit";
        document.body.removeChild(this.original);
      } else {
        // Get the font size and threshold
        const cs = window.getComputedStyle(this.target, null);
        fontSize = parseFloat(cs.fontSize);
      }

      const lineThreshold = fontSize * 0.2;
      let wordsInEachLine = [];
      let wordsInCurrentLine = [];

      this.wordArray.forEach((w) => {
        const { top } = this.getPosition(w, this.target);
        if (lineOffset === null || top - lineOffset >= lineThreshold) {
          lineOffset = top;
          wordsInEachLine.push((wordsInCurrentLine = []));
        }

        wordsInCurrentLine.push(w);
      });

      // clear the word arrays to stop confusion
      this.wordArray = [];
      this.wordParentArray = [];

      // clear target inner
      this.target.innerHTML = "";

      wordsInEachLine.forEach((wa) => {
        const lineOuterSpan = this.outerSpan.cloneNode();
        this.target.appendChild(lineOuterSpan);
        this.lineParentArray.push(lineOuterSpan);

        let builtString = "";

        wa.forEach((w, i) => {
          builtString += w.innerHTML;
          if (i !== wa.length - 1) {
            builtString += " ";
          }
        });

        if (builtString !== "") {
          const lineInnerSpan = this.innerSpan.cloneNode();

          lineInnerSpan.innerHTML = builtString;
          lineOuterSpan.appendChild(lineInnerSpan);

          this.lineArray.push(lineInnerSpan);
        }
      });
    }
  }

  getPosition(node, parent) {
    const parentRect = parent.getBoundingClientRect();
    const { width, height, x, y } = node.getBoundingClientRect();
    const left = x - parentRect.x;
    const top = y - parentRect.y;

    return { width, height, top, left };
  }

  // Handle resize events
  bindResizeHandler() {
    // Add window resize listener
    window.addEventListener("resize", this.handleResize.bind(this));

    // Create a ResizeObserver to watch for container size changes
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.handleResize.bind(this));
      this.resizeObserver.observe(this.target.parentElement || this.target);
    }
  }

  // Debounced resize handler
  handleResize() {
    // Clear previous timeout to debounce
    if (this.resizeTimeout) {
      clearTimeout(this.resizeTimeout);
    }

    // Set new timeout
    this.resizeTimeout = setTimeout(() => {
      // Re-split and initialize when resized
      this.split();
    }, this.resizeDebounce);
  }

  // Clean up method to remove event listeners
  destroy() {
    // Remove resize event listener
    window.removeEventListener("resize", this.handleResize.bind(this));

    // Disconnect observer if it exists
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    // Restore original content
    this.target.innerHTML = this.originalContent;
  }
}

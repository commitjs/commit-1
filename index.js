function html(strs, ...exprs) {
  const html = strs.reduce((acc, curr, index) => {
    const currentExpr = exprs[index];
    let result = acc + curr;
    if (currentExpr !== undefined) {
      result += currentExpr;
    }
    return result;
  }, "");
  const template = document.createElement("template");
  template.innerHTML = html;
  return template;
}

const sharedStyles = `<style>button { color: red; }</style>`;

const getAppTemplate = (context, styles = []) => html`
  ${styles.join("")}
  <style>
    #counter-container {
      color: green;
    }
  </style>
  <div id="counter-container">Counter <span id="counter">${
    context.counter
  }</span></div>
  <slot name="test"></slot>
  <button id="inc-btn">Increment</button>
`;

// { 'querySelector': value }
const updateTemplateFactory = root => updates => {
  Object.entries(updates).forEach(([selector, value]) => {
    const el = root.querySelector(selector);
    if (!el) {
      return;
    }
    el.innerHTML = value;
  });
};

class App extends HTMLElement {
  set counter(value) {
    this._counter = value;
    this._update({ "#counter": this.counter });
  }

  get counter() {
    return this._counter;
  }

  constructor() {
    super();
    const root = this.attachShadow({ mode: "closed" });
    this._update = updateTemplateFactory(root);
    root.appendChild(
      getAppTemplate(this, [sharedStyles]).content.cloneNode(true)
    );

    this.counter = 0;

    const incBtn = root.getElementById("inc-btn");
    incBtn.addEventListener("click", () => {
      this.counter++;

      const TestCtr = customElements.get("hg-test");
      const myTest = new TestCtr("Some args...");

      root.appendChild(myTest);

      myTest.addEventListener('loaded', (e) => console.log(e));

      // setTimeout(() => {
      //   myTest.setAttribute('data-id', 1000)
      // }, 5000);
    });
  }
}

customElements.define("hg-app", App);

const getTestTemplate = (context, styles = []) => html`
  <h1>HELLO</h1>
  <ul id="post-list"></ul>
`;

class Test extends HTMLElement {

  #postListEl = null;

  static get observedAttributes() {
    return ['data-id'];
  }

  constructor(...stuff) {
    super();
    console.log(stuff);
    const root = this.attachShadow({ mode: "closed" });
    root.appendChild(getTestTemplate(this).content.cloneNode(true));
    this.#postListEl = root.getElementById('post-list');
  }

  connectedCallback() {
    fetch('https://jsonplaceholder.typicode.com/posts').then(res => res.json()).then(posts => {
      posts.forEach(post => {
        const liEl = document.createElement('li');
        liEl.innerHTML = post.title;
        this.#postListEl.appendChild(liEl);
      });
      this.dispatchEvent(new CustomEvent('loaded', { detail: posts }));
    });
  }

  disconnectedCallback() {
    console.log('component was removed');
  }

  attributeChangedCallback(name, oldValue, newValue) {
    console.log(name, oldValue, newValue);
  }

}

customElements.define("hg-test", Test);;
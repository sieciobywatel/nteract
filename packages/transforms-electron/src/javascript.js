/* @flow */
import React from "react";

const vm = require("vm");

type Props = {
  data: string
};

export function runCodeHere(el: HTMLElement, code: string): any {
  // Compatibility with Jupyter/notebook JS evaluation.  Set element so
  // the user has a handle on the context of the current output.
  const element = el;

  const sandbox = {
    // TODO: until this is inside a webview or iframe, this escape hatch
    // means we're **NOT** properly sandboxed
    element,
    document,

    console: {
      log: console.log.bind(console),
      error: console.error.bind(console)
    }
  };

  const ctxt = vm.createContext(sandbox);

  try {
    vm.runInContext(code, ctxt, {
      filename: "kernel-output",
      lineOffset: 0,
      timeout: 2000,
      displayErrors: false
    });
  } catch (err) {
    const pre = document.createElement("pre");
    if (err.stack) {
      pre.textContent = err.stack;
    } else {
      pre.textContent = err;
    }
    element.appendChild(pre);
    return err;
  }
}

class JavaScriptDisplay extends React.Component {
  props: Props;
  el: HTMLElement;

  componentDidMount(): void {
    runCodeHere(this.el, this.props.data);
  }

  shouldComponentUpdate(nextProps: Props): boolean {
    return nextProps.data !== this.props.data;
  }

  componentDidUpdate(): void {
    runCodeHere(this.el, this.props.data);
  }

  render(): ?React.Element<any> {
    return (
      <div
        ref={el => {
          this.el = el;
        }}
      />
    );
  }
}

JavaScriptDisplay.MIMETYPE = "application/javascript";

export default JavaScriptDisplay;

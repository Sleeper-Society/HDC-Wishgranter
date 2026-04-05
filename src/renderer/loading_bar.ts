import type PreloadedWindow from "./bridge.ts";

class LoadingBarElement extends HTMLElement {
  split_stack: number[] = [];
  initial_split = 0;
  completion_stack: number[] = [];
  constructor() {
    super();
    this.split_stack = [];
    this.initial_split = 0;
    this.completion_stack = [];
  }
  split(peices: number) {
    if (this.split_stack.length == 0 && this.initial_split == 0) {
      this.initial_split = peices;
    }
    this.split_stack.push(peices);
    this.completion_stack.push(0);
    this.rerender();
  }
  complete() {
    if (
      ++this.completion_stack[this.completion_stack.length - 1] >=
      this.split_stack[this.split_stack.length - 1]
    ) {
      this.completion_stack.pop();
      this.split_stack.pop();
    }
    this.rerender();
  }
  getCompletionPercent(completion_stack: number[]) {
    return completion_stack.reduce(
      (previous_value: number, current_value: number, index: number) => {
        const sub_split_stack = this.split_stack.slice(0, index + 1);
        const sum = sub_split_stack.reduce(
          (previous_value: number, current_value: number) => {
            return previous_value * current_value;
          },
          1,
        );
        return previous_value + current_value / sum;
      },
      0,
    );
  }
  rerender() {
    let gradient = "linear-gradient(to right, rgb(var(--forground-color)) 0%";
    let completion_percent = this.getCompletionPercent(this.completion_stack);
    gradient +=
      ", rgb(var(--forground-color)) " +
      (completion_percent * 100).toString() +
      "%";
    for (let index = this.completion_stack.length - 1; index >= 0; index--) {
      const sub_completion_stack = this.completion_stack.slice(0, index + 1);
      sub_completion_stack[sub_completion_stack.length - 1]++;
      const new_completion_percent =
        this.getCompletionPercent(sub_completion_stack);
      gradient +=
        ", rgba(var(--forground-color)," +
        (1 / (this.completion_stack.length - index)).toString() +
        ") " +
        (completion_percent * 100).toString() +
        "%";
      gradient +=
        ", rgba(var(--forground-color)," +
        (1 / (this.completion_stack.length - index)).toString() +
        ") " +
        (new_completion_percent * 100).toString() +
        "%";
      completion_percent = new_completion_percent;
    }
    gradient +=
      ", rgba(var(--background-color), 0) " +
      (completion_percent * 100).toString() +
      "%";
    this.style.background =
      gradient + ", rgba(var(--background-color), 0) 100%)";
  }
  connectedCallback() {
    const loading = (window as unknown as PreloadedWindow).loading;
    loading.onNewStatus((new_status: string | null) => {
      this.textContent = new_status;
    });
    loading.onSplit(this.split.bind(this));
    loading.onComplete(this.complete.bind(this));
  }
}

customElements.define("loading-bar", LoadingBarElement);

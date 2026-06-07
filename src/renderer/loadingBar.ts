import type { PathLike } from "fs";
class LoadingBarElement extends HTMLElement {
  private text?: HTMLParagraphElement;

  connectedCallback() {
    this.text = document.createElement("p");
    this.append(this.text);
  }

  private async _runThroughLoadingSequence<
    CallParamaters extends unknown[] = [hyperspace_path: PathLike],
  >(
    load_sequence: Iterable<LoadSequenceElement<CallParamaters>> & {
      length?: number;
    },
    bar: HTMLElement,
    ...args: CallParamaters
  ) {
    const new_sub_bars: Record<number, HTMLElement> = load_sequence.length
      ? Array.from({ length: load_sequence.length }, () => {
          const element = document.createElement("div");
          bar.append(element);
          return element;
        })
      : new Proxy(
          {},
          {
            get() {
              bar.classList.add("unknown_length");
              return bar;
            },
          },
        );
    await (
      load_sequence[Symbol.iterator]() as IteratorObject<LoadSequenceElement>
    ).reduce(
      (promise, element, index) =>
        promise.then(
          () =>
            new Promise<void>((resolve) => {
              if (this.text) this.text.textContent = element.status_text;
              const sub_bar = new_sub_bars[index];
              sub_bar.classList.remove("loaded"); //In case of unknown length
              sub_bar.classList.add("loading");
              if (element.estimated_loading_time_multiplier)
                sub_bar.style.flexGrow =
                  element.estimated_loading_time_multiplier.toString();
              window.requestAnimationFrame(() => {
                // Wait for the dom to update
                // Since I'm not expecting the inner function to wait, I'm handling it with a mesa promise
                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                window.requestAnimationFrame(async () => {
                  const sub_sequence = await element.function(...args);
                  if (sub_sequence) {
                    await this._runThroughLoadingSequence(
                      sub_sequence,
                      sub_bar,
                      ...args,
                    );
                  }
                  sub_bar.classList.remove("loading");
                  sub_bar.classList.add("loaded");
                  resolve();
                });
              });
            }),
        ),
      Promise.resolve(),
    );
    bar.classList.remove("unknown_length");
    if (load_sequence.length) {
      (new_sub_bars as HTMLElement[]).forEach((sub_bar) => {
        sub_bar.remove();
      });
    }
    if (this.text) this.text.textContent = "";
  }
  public async runThroughLoadingSequence<
    CallParamaters extends unknown[] = [hyperspace_path: PathLike],
  >(
    load_sequence: Iterable<LoadSequenceElement<CallParamaters>> & {
      length?: number;
    },
    ...args: CallParamaters
  ) {
    await this._runThroughLoadingSequence(load_sequence, this, ...args);
  }
}

customElements.define("loading-bar", LoadingBarElement);

export type { LoadingBarElement };
export interface LoadSequenceElement<
  CallParamaters extends unknown[] = unknown[],
> {
  status_text: string;
  estimated_loading_time_multiplier?: number;
  function:
    | ((...args: CallParamaters) => void)
    | ((...args: CallParamaters) => Promise<void>)
    | ((
        ...args: CallParamaters
      ) => Iterable<LoadSequenceElement<CallParamaters>> & { length?: number })
    | ((
        ...args: CallParamaters
      ) => Promise<
        Iterable<LoadSequenceElement<CallParamaters>> & { length?: number }
      >);
}

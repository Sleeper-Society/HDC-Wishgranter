import type { Faction, Card, Dongle } from "wishgranter";
type ExpandedParameter<W> = W extends (infer I)[]
  ? (ExpandedParameter<I> | Record<string, ExpandedParameter<I> | undefined>)[]
  : Partial<W> | string;
function parseContentAddingFunction<A extends unknown[] = unknown[]>(
  content_adding_function: (...args: A) => void,
  ...parsers: {
    [K in keyof A]: (
      paramater: ExpandedParameter<A[K]>,
    ) => IteratorObject<A[K]>;
  }
): (...args: { [K in keyof A]: ExpandedParameter<A[K]> }) => void {
  return (...args) => {
    args
      .map((argument, index) =>
        parsers[index < parsers.length ? index : parsers.length - 1](argument),
      )
      .reduce(
        (
          generated_combinotorics: IteratorObject<
            { [K in keyof A]: IteratorObject<A[K]> }[number]
          >,
          multiplier,
        ) =>
          multiplier.flatMap((argument: A[number]) =>
            generated_combinotorics.map(function* (combinitoric) {
              yield* combinitoric;
              yield argument;
            }),
          ),

        [][Symbol.iterator](),
      )
      .forEach((new_args) => {
        content_adding_function(...(new_args as unknown as A));
      });
  };
}
function parseFaction(
  faction: ExpandedParameter<Faction>,
): IteratorObject<Faction> {}
function parseOptionalFaction(
  faction: ExpandedParameter<Faction | undefined>,
): IteratorObject<Faction | undefined> {}
function parseCard(card: ExpandedParameter<Card>): IteratorObject<Card> {}
function parseCards(cards: ExpandedParameter<Card[]>): IteratorObject<Card[]> {}
function parseDongle(
  dongle: ExpandedParameter<Dongle>,
): IteratorObject<Dongle> {}
function parseDongles(
  dongle: ExpandedParameter<Dongle[]>,
): IteratorObject<Dongle[]> {}
export const addCards = parseContentAddingFunction(
  addCardsBase,
  parseFaction,
  parseOptionalFaction,
  parseCard,
);
function addCardsBase(
  faction: Faction,
  additional_faction?: Faction,
  ...cards: Card[]
): void {}
export const addStartingCommanders = parseContentAddingFunction(
  addStartingCommandersBase,
  parseFaction,
  parseCards,
  parseDongles,
  parseCard,
);
function addStartingCommandersBase(
  faction: Faction,
  cards: Card[],
  dongles: Dongle[],
  ...commanders: Card[]
) {}

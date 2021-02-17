export interface Card {
  name: string;
}

export interface CardAndCount {
  name: string;
  count: number;
}

const pack: Array<CardAndCount> = [
  { name: 'black', count: 12 },
  { name: 'blue', count: 12 },
  { name: 'green', count: 12 },
  { name: 'orange', count: 12 },
  { name: 'pink', count: 12 },
  { name: 'red', count: 12 },
  { name: 'white', count: 12 },
  { name: 'yellow', count: 12 },
  { name: 'locomotive', count: 14 },
];

export function createDeck() {
  const deck: Array<Card> = [];
  for (const cardType of pack) {
    const card: Card = { name: cardType.name };
    let { count } = cardType;
    while (count) {
      deck.push(card);
      count -= 1;
    }
  }
  return deck;
}

export function shuffleDeck(deck: Array<Card>) {
  const shuffledDeck: Array<Card> = [];
  while (deck.length !== 0) {
    const cardIndex = Math.floor(Math.random() * deck.length);
    shuffledDeck.push(deck.splice(cardIndex, 1)[0]);
  }

  return shuffledDeck;
}

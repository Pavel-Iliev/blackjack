(function () {
  const btnStartEl = document.getElementById("btnStart");
  let endGameEl = document.getElementById("end-game");
  let btnHit = document.getElementById("btnHit");
  let btnStay = document.getElementById("btnStay");
  let endGameTextEl = document.getElementById('end-game-text');

  
  if (!btnStartEl || !endGameEl || !btnHit || !btnStay || !endGameTextEl) {
    return;
  }

  const players = getPlayers();
  let deck = buildDeck();
  let endGameImg = document.createElement('img');

  function getPlayerByName(name) {
    return (
      players.find(function (player) {
        return player.name === name;
      }) || {}
    );
  }

  function getPlayers() {
    return [
      {
        name: "dealer",
        points: 0,
        hand: [],
        hasAce: false,
      },
      {
        name: "player",
        points: 0,
        hand: [],
        hasAce: false,
      },
    ];
  }

  function shuffle(deck) {
    let j, x, i;

    for (i = deck.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = deck[i];
      deck[i] = deck[j];
      deck[j] = x;
    }

    return deck;
  }

  function buildDeck() {
    const deck = [];
    const suits = ["Spades", "Hearts", "Diamonds", "Clubs"];
    const values = [
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
      "J",
      "Q",
      "K",
      "A",
    ];

    for (let i = 0; i < suits.length; i++) {
      for (let j = 0; j < values.length; j++) {
        let weight = parseInt(values[j]);

        if (values[j] === "J" || values[j] === "Q" || values[j] === "K") {
          weight = 10;
        }

        if (values[j] === "A") {
          weight = 11;
        }

        deck.push({
          suit: suits[i],
          value: values[j],
          weight: weight,
        });
      }
    }

    return shuffle(deck);
  }

  function cleanPlayStation(players) {
    players.forEach(function (player) {
      player.hand = [];

      const playerEl = document.getElementById(player.name);

      if (playerEl) {
        playerEl.innerHTML = "";
      }
    });

    endGameEl.classList.remove('end');
    endGameEl.innerText = "";
  }

  function createPlayStation(id) {
    const el = document.getElementById(id);

    if (!el) {
      return;
    }

    const wrapPlayerEl = document.createElement("div");
    const wrapPlayerHandEl = document.createElement("div");
    const wrapPlayerPointsEl = document.createElement("div");

    wrapPlayerEl.classList.add("wrap__player");
    wrapPlayerEl.innerHTML = "<h3>" + id + "</h3>";

    wrapPlayerHandEl.id = "hand-" + id;
    wrapPlayerHandEl.classList.add("wrap__player--hand");

    wrapPlayerPointsEl.id = "points-" + id;
    wrapPlayerPointsEl.classList.add("wrap__player--points");

    el.appendChild(wrapPlayerEl);
    wrapPlayerEl.appendChild(wrapPlayerHandEl);
    wrapPlayerEl.appendChild(wrapPlayerPointsEl);
    wrapPlayerPointsEl.appendChild(document.createElement("span"));
  }

  function renderDeckCount(deck) {
    const deckCountEl = document.getElementById("deckcount");

    if (!deckCountEl) {
      return;
    }

    deckCountEl.innerHTML = deck.length;
  }

  function checkPlayerHandHasAce(player) {
    const arrCheck = [];

    for (let i = 0; i < player.hand.length; i++) {
      arrCheck.push(player.hand[i].value);
    }

    if (arrCheck.includes("A")) {
      player.hasAce = true;
    }
  }

  function calculatePoints(player) {

    player.points = player.hand.reduce(function (total, point) {
      return (total += point.weight);
    }, 0);

    checkPlayerHandHasAce(player);

    // if there is an ace and points go over 21, value of ace == 1
    if (player.points > 21 && player.hasAce === true) {
      player.points = player.points - 10;
      player.hasAce = false;
    }
    return player.points;
  }

  function renderPoints(player) {
    const pointsPlayer = document.getElementById("points-" + player.name);

    if (!pointsPlayer) {
      return;
    }

    pointsPlayer.innerText = calculatePoints(player);
  }

  function getCard(card) {
    let divEl = document.createElement("div");

    divEl.className = "card "+ card.suit.toLowerCase();

    let wrapCardValue = document.createElement("span");
    let wrapCardValueBottom = document.createElement("span");
    wrapCardValue.innerText = card.value;
    wrapCardValueBottom.innerText = card.value

    divEl.appendChild(wrapCardValue);
    divEl.appendChild(wrapCardValueBottom);

    return divEl;
  }

  function renderCards(card, playerName) {
    const handEl = document.getElementById("hand-" + playerName);

    if (!handEl) {
      return;
    }

    handEl.appendChild(getCard(card));
  }

  function dealCards(player, deck) {
    for (let i = 0; i < 2; i++) {
      const card = deck.pop();
      player.hand.push(card);

      renderCards(card, player.name);
      renderPoints(player);
    }

    renderDeckCount(deck);
  }

  function checkBlackJack(dealer, player) {

    if (player.points === 21 && dealer.points === 21) {
      endGameClass()
      gameDraw();
      resetBtns();
    } else if (player.points === 21 && player.points !== dealer.points) {
      endGameClass()
      playerWin(player);
      resetBtns();
    } else if (dealer.points === 21 && player.points !== dealer.points) {
      endGameClass()
      playerLose(player);
      resetBtns();
    }
  }

  function resetBtns() {
    btnStartEl.removeAttribute("disabled");
    btnStartEl.value = "Restart Game";

    Array.from([btnStay, btnHit]).forEach(function (el) {
      el.setAttribute("disabled", "disabled");
    });
  }

  function onStartGame() {
    removeEndGameClass();
    deck = buildDeck();
    cleanPlayStation(players);

    btnStartEl.setAttribute("disabled", "disabled");
    Array.from([btnStay, btnHit]).forEach(function (el) {
      el.removeAttribute("disabled");
    });

    players.forEach(function (player) {
      createPlayStation(player.name);
      dealCards(player, deck);
    });

    checkBlackJack(getPlayerByName("dealer"), getPlayerByName("player"));
  }

  function onStay(dealer, player) {
    btnHit.setAttribute("disabled", "disabled");

    while (dealer.points < player.points) {
      let card = deck.pop();
      dealer.hand.push(card);
      calculatePoints(dealer);
      renderCards(card, dealer.name);
      renderPoints(dealer);

      // check if drow on 21 to see which player have less card and win
      if (dealer.points === player.points && player.points === 21) {
        if (dealer.hand.length > player.hand.length) {
          endGameClass()
          playerWin(player);
        } else if (dealer.hand.length < player.hand.length) {
          endGameClass()
          playerLose(player);
        } else {
          endGameClass()
          gameDraw();
        }
        resetBtns();
      }
    }

    if(player.points === dealer.points && dealer.hand.length > player.hand.length && dealer.points < 21) {
      let card = deck.pop();
      dealer.hand.push(card);
      calculatePoints(dealer);
      renderCards(card, dealer.name);
      renderPoints(dealer);
    }

    if(player.points === dealer.points && dealer.hand.length <= player.hand.length && dealer.points < 21) {
      endGameClass()
      playerLose(player);
      resetBtns();
    }

    //check if dealer win the game
    if (player.points < dealer.points && dealer.points <= 21) {
      endGameClass()
      playerLose(player);
      resetBtns();
    }

    //check if dealer lost the game
    if (dealer.points > 21) {
      endGameClass()
      playerWin(player);
      resetBtns();
    }
  }

  function checkAndRenderPlayerHasLost(player) {
    if (player.points > 21) {
      endGameClass()
      playerLose(player);
      resetBtns();
    }
  }

  function endGameClass() {
    endGameEl.classList.add('end')
  }

  function removeEndGameClass() {
    endGameEl.classList.remove('end')
  }

  function playerLose(player) {
    endGameTextEl.innerText = player.name + " has lost the game";

    endGameImg.src = 'img/lose.gif';

    endGameEl.appendChild(endGameTextEl);
    endGameEl.appendChild(endGameImg);
  }

  function playerWin(player) {
    endGameTextEl.innerText = player.name + " win the game";

    endGameImg.src = 'img/win.gif';

    endGameEl.appendChild(endGameTextEl);
    endGameEl.appendChild(endGameImg);
  }

  function gameDraw() {
    endGameTextEl.innerText = 'the game is draw';

    endGameImg.src = 'img/equal.gif';

    endGameEl.appendChild(endGameTextEl);
    endGameEl.appendChild(endGameImg);
  }

  function onHit(deck, player) {
    const card = deck.pop();
    player.hand.push(card);

    renderCards(card, player.name);
    calculatePoints(player)
    renderPoints(player);
    renderDeckCount(deck);
    checkAndRenderPlayerHasLost(player);
  }

  btnStartEl.addEventListener("click", onStartGame);
  btnStay.addEventListener("click", function () {
    onStay(getPlayerByName("dealer"), getPlayerByName("player"));
  });
  btnHit.addEventListener("click", function () {
    onHit(deck, getPlayerByName("player"));
  });
  
})();

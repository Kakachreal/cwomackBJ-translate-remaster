const suits = ['s', 'c', 'd', 'h'];
const pips = ['02', '03', '04', '05', '06', '07', '08', '09', '10', 'J', 'Q', 'K', 'A'];
let playerHand = [];
let computerHand = [];
let masterDeck = [];
let score = {
    player: 0,
    computer: 0,
};
let bet = 0;
let daBank = 500;
const betDisplay = document.querySelector('.betDisplay');
const moneyDisplay = document.querySelector('.moneyDisplay');
const newGameBtn = document.getElementById('newGame');
const hitBtn = document.getElementById('hit');
const standBtn = document.getElementById('stand');
const betBtn = document.getElementById('bet');
const nextHandBtn = document.getElementById('nextHand');
const playerArea = document.querySelector('.playerHand');
const computerArea = document.querySelector('.computerHand');
const pCardArea = playerArea.querySelector('.playArea');
const cCardArea = computerArea.querySelector('.playArea');
const message = document.getElementById('message');
const bettingContainer = document.getElementById('bettingContainer');
const betBtns = bettingContainer.querySelectorAll('.bet');
const pBoardScore = playerArea.querySelector('.scoreDisplay .plyrScore');
const defaultCardHTML = `
    <div class="card back-red"></div>
    <div class="card back-red"></div>
`;
//  ------------------- MASTER DECK -------------------
function buildMasterDeck(){ 
    masterDeck = [],
    suits.forEach(function(suit) {
        pips.forEach(function(pip) {
            let cardObj = {
                suit: suit,
                pip: pip,
                value: Number(pip) || (pip === 'A' ? 11 : 10),
                isHidden: false,
            }
            masterDeck.push(cardObj);
        });
    });
}
buildMasterDeck();
let playDeck = [...masterDeck];
function deal() {
    if (playDeck.length >= 1) {
        let newCard = playDeck.splice((Math.floor(Math.random() * playDeck.length)), 1);
        return newCard[0];
    } else {
        playerHand;
    }
    render();
};
//  ------------------- PLAY F(x)'s -------------------
function startHand() {
    let randomPlayerCard = deal();
    playerHand.push(randomPlayerCard);

    let randomComputerCard = deal();
    randomComputerCard.isHidden = true;
    computerHand.push(randomComputerCard);

    let randomPlayerCard2 = deal();
    playerHand.push(randomPlayerCard2);

    let randomComputerCard2 = deal();
    computerHand.push(randomComputerCard2);

    calcScore();
    render();
    newGameBtn.disabled = true;
    hitBtn.disabled = false;
    standBtn.disabled = false;
    betBtn.disabled = false;
};
function init() {
    score.player = 0;
    score.computer = 0;
    playerHand = [];
    computerHand = [];
    hitBtn.disabled = true;
    standBtn.disabled = true;
    betBtn.disabled = daBank <= 0; // Disable betting if bank is 0
    newGameBtn.disabled = true; // Disabled until a bet is placed
    nextHandBtn.disabled = true;
    pBoardScore.innerHTML = score.player;
    pCardArea.innerHTML = defaultCardHTML;
    cCardArea.innerHTML = defaultCardHTML;
    message.textContent = daBank > 0 ? '' : "თქვენი ბალანსი 0-ს შეადგენს, გთხოვთ დაიწყოთ თავიდან.";
    bet = 0;
    setTimeout(() => {
        message.textContent = ''; // Clear the message
    }, 2000); // 3000ms = 3 seconds
    daBank = daBank > 0 ? daBank : 0; // Ensure the bank is never negative
    moneyDisplay.textContent = `$${daBank}`;
    betDisplay.textContent = `$${bet}`;
}

function createCardEl(card) {
    return `<div class="card ${card.isHidden ? "back-red" : ""} ${card.suit}${card.pip}"></div>`
}
function render () {
    pBoardScore.textContent = score.player;
    let playerCardHTML = '';
    let computerCardHTML = '';
    playerHand.forEach((card) => {
        playerCardHTML += createCardEl(card);
    })
    pCardArea.innerHTML = playerCardHTML;
    computerHand.forEach((card) => {
        computerCardHTML += createCardEl(card);
    })
    cCardArea.innerHTML = computerCardHTML;
}
function scoreReset() {
    score.player = 0;
    score.computer = 0;
}
function calcScore() {
    playerHand.forEach((card) => {
        // score.player = score.player + card.value is same as below
        score.player += card.value
    });
    computerHand.forEach((card) => {
        // score.computer = score.computer + card.value is same as below
        score.computer += card.value 
    });
}
function hit(turn = "player") {
    const whosHand = turn === 'computer' ? computerHand : playerHand;
    let randomPlayerCard = deal();
    whosHand.push(randomPlayerCard);
    
    if (turn === 'computer') {
        score.computer += randomPlayerCard.value;
    } else {
        score.player +=randomPlayerCard.value;
    }
    render();
    if (score.computer === 21 || score.player > 21) {
        win('computer');
        return;
    }
    if (score.computer === score.player) {
        win('tie');
        return;
    }
    if (score.computer > 21) {
        win('player');
        return;
    }
    if (score.player === 21){
        win('player');
    }
}
function revealDealerCard() {
    cCardArea.firstChild.classList.remove('back-red');
}
function stand() {
    revealDealerCard();
    while (score.computer < 17 || score.computer < score.player) {
        hit('computer');
        revealDealerCard();
    };
    if (score.computer > 21) {
        win('player');
        return;
    }
    if (score.computer > score.player && score.computer < 22){ 
        win('computer');
        return;
    }; 
    if (score.computer === score.player) {
        win('tie');
        return;
    };  
}
function win(whoWon) {
    revealDealerCard();

    if (whoWon === 'tie') { 
        message.textContent = "Push! ორივე მხარეს დაუბრუნდათ მათი ფსონები.";
        // No change in bank for a push
    } else {
        message.textContent = `${whoWon === "player" ? 'თქვენ მოიგეთ!' : 'დილერმა მოიგო, წარმატებები მომავალ ჯერზე.'}`;
    }

    if (whoWon === 'player') {
        // Check if it's a Blackjack
        const isBlackjack = playerHand.length === 2 && score.player === 21;
        payout(true, isBlackjack);  // Call payout for player win
    } else if (whoWon === 'computer') {
        payout(false); // Player loses, deduct the bet
    } else {
        // For a push, we don't change the bank balance, we just return the bet
        daBank += bet;  // Add the bet back to the bank (the player doesn't lose)
    }

    // Disable buttons after the game outcome
    nextHandBtn.disabled = false;
    newGameBtn.disabled = true;
    hitBtn.disabled = true;
    standBtn.disabled = true;
    betBtn.disabled = true;

    // Automatically clear the message after 3 seconds
    setTimeout(() => {
        message.textContent = ''; // Clear the message
    }, 2000); // 3000ms = 3 seconds
}

function handleBet(e) {
    if (daBank <= 0) {
        message.textContent = "აღარ გაქვთ ფული ფსონის დასადებად!";
        setTimeout(() => {
            message.textContent = ''; // Clear the message after 3 seconds
        }, 2000); // 3000ms = 3 seconds
        return;
    }


    let chipValue = parseInt(e.target.textContent);

    // Prevent the player from betting more than their bank balance
    if (bet + chipValue > daBank) {
        message.textContent = "ვერ დადებთ ფსონს რომელიც რომელიც აღემატება თქვენს ბალანსს";
        return;
        setTimeout(() => {
            message.textContent = ''; // Clear the message
        }, 2000); // 3000ms = 3 seconds
    }

    bet += chipValue;
    betDisplay.textContent = `$${bet}`;
    message.textContent = ''; // Clear any previous error messages

    if (bet > 0) {
        newGameBtn.disabled = false; // Enable the "New Game" button
    }
}

function payout(isWin, isBlackjack = false) {
    if (isWin) {
        if (isBlackjack) {
            // Blackjack payout (3:2), so you get 1.5x your bet in addition to your original bet
            daBank += Math.floor(bet * 1.5);  // 1.5 times the bet for Blackjack
        } else {
            // Regular win payout (2:1), you get double your bet (your bet + your bet)
            daBank += bet * 2;  // Bet + Bet (for regular wins, 2:1 payout)
        }
    } else {
        // Deduct the bet if the player loses
        daBank -= bet;
    }

    // Update the display with the new balance
    moneyDisplay.textContent = `$${daBank}`;
}





function nextHand() {
    init();
    deal();
}

init();

//  ------------------- EVENT LISTENERS -------------------
newGameBtn.addEventListener('click', startHand);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
betBtn.addEventListener('click', function(){
    bettingContainer.classList.toggle("active");
});
betBtns.forEach(btn => {
    btn.addEventListener('click', handleBet)
})
nextHandBtn.addEventListener('click', nextHand)
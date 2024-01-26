const _ = require('underscore')
const crypto = require('crypto')
const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
})
const { Table: Printer } = require('console-table-printer')

class RPS {
    static defineWinner(a, b, moves) {
        if (a === b) return 0
        const half = (moves.length - 1) / 2
        const ai = moves.indexOf(a)
        let bi = moves.indexOf(b)
        if (bi < ai) bi += moves.length

        let aWins = true
        for (let i = 1; i <= half; i++) {
            if (ai + i === bi) aWins = false
        }
        return aWins ? -1 : 1
    }
}

class Game {
    #key
    #randomMove
    #HMAC
    constructor(moves) {
        this.moves = moves
        this.#key = crypto.generateKeySync('hmac', { length: 256 })
        this.#randomMove = _.sample(moves)
        this.#HMAC = crypto.createHmac('sha3-256', this.#key).update(this.#randomMove).digest('hex')
    }

    printMenu() {
        console.log('Available moves:')
        this.moves.forEach((move, idx) => {
            console.log(`${idx + 1} - ${move}`)
        })
        console.log('0 - exit')
        console.log('? - help')
    }

    start() {
        console.log('HMAC:', this.#HMAC)
        this.promptUser()
    }

    promptUser() {
        this.printMenu()
        readline.question('Enter your move: ', this.askForMove.bind(this))
    }

    askForMove(answer) {
        if (this.moves.map((_, i) => i + 1).includes(+answer)) {
            readline.close()
            const userMove = this.moves[+answer - 1]
            console.log('Your move:', userMove)
            console.log('Computer move:', this.#randomMove)
            const winner = RPS.defineWinner(this.#randomMove, userMove, this.moves)
            switch (winner) {
                case 0:
                    console.log('Draw')
                    break
                case -1:
                    console.log('You lose')
                    break
                case 1:
                    console.log('You win!')
                    break
            }
            console.log('HMAC key:', this.#key.export().toString('hex'))
        } else if (answer === '0') {
            readline.close()
            console.log('Goodbye!')
        } else if (answer === '?') {
            Table.print(this.moves)
            this.promptUser()
        } else {
            this.promptUser()
        }
    }
}

class Table {
    static print(moves) {
        const p = new Printer()
        moves.forEach((userMove) => {
            p.addRow({
                'user/computer': userMove,
                ...moves.reduce((acc, computerMove) => {
                    const result = RPS.defineWinner(computerMove, userMove, moves)
                    switch (result) {
                        case 0:
                            return { ...acc, [computerMove]: 'Draw' }
                        case -1:
                            return { ...acc, [computerMove]: 'You lose' }
                        case 1:
                            return { ...acc, [computerMove]: 'You win!' }
                    }
                }, {}),
            })
        })
        p.printTable()
    }
}

const moves = process.argv.slice(2)

const length = moves?.length || 0
if (length < 3) {
    console.log('Please try again with at least 3 moves: "1 2 3", not "1 2"')
    process.exit()
}
if (length % 2 === 0) {
    console.log('Please try again with an odd number of moves: "1 2 3 4 5", not "1 2 3 4"')
    process.exit()
}
if (length !== _.uniq(moves).length) {
    console.log('Please try again with unique moves: "1 2 3", not "1 1 3"')
    process.exit()
}

const game = new Game(moves)
game.start()

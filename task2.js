const { SHA3 } = require('sha3')
const fs = require('fs')

const files = fs.readdirSync('./task2')

const hashes = files.map(file => {
  const hash = new SHA3(256)
  const content = fs.readFileSync(`./task2/${file}`)
  const result = hash.update(content).digest('hex')
  return result
})

hashes.sort()

const allOfThem = hashes.join('') + 'email@email.com'

const resultHash = new SHA3(256).update(allOfThem).digest('hex')

console.log(resultHash)

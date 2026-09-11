import './style.css'

const app = document.querySelector('#app')

if (app === null) {
  throw new Error('The app root is missing.')
}

const heading = document.createElement('h1')
heading.textContent = 'Game v5'
app.append(heading)

# GitHub E-Mail Exposer

## Description

GitHub E-Mail Exposer is a web application that allows you to find all e-mail addresses associated with a certain GitHub account. It reads the public commit data of GitHub's API to expose e-mail addresses that are not explicitly hidden by users. These e-mail adresses are public anyway, so nothing illegal is happening here 😎

## Features

- Search for GitHub users by username
- Display e-mail addresses of the searched user and their collaborators
- Copy e-mail addresses to clipboard with a single click
- Responsive design for various screen sizes
- Free to use, within GitHub's limit of 60 unauthenticated requests per hour. However, one username search can cost multiple requests at the moment. If you have an idea how to fix that, feel free to do so and open a pull request 😎

## How the addresses are found

GitHub used to include the commit details, and with them the author e-mail
addresses, in the public events of an account. That field has been removed from
the API, so the addresses are now read from two other public sources:

1. `GET /search/commits?q=author:<username>` for the commits the user has
   authored anywhere on GitHub. This is where their own address shows up.
2. `GET /repos/<owner>/<repo>/commits` for the most recently pushed
   repositories of the user, which is where the addresses of their
   collaborators show up.

Addresses that GitHub generates itself, everything ending in
`users.noreply.github.com` and the `noreply@github.com` of the web interface,
are filtered out, because they belong to nobody.

One lookup therefore costs several API requests instead of a single one. The
number of repositories that get scanned is capped in `src/services/apiGithub.ts`
to keep a lookup within the hourly limit.

## Tech Stack Used

- React
- TypeScript
- Tailwind CSS
- Vite

~~I might add unit tests with Vitest on a later stage.~~ Done ✅

## Tests

Start the tests with `npm test` or `npm run test:watch`.

There is one smoke test, that one doesn't succeed of course when the 1 hour contingent is used up. Run it with `npm run test:live`.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- Node.js (v14.0.0 or later)
- npm (v6.0.0 or later)

## Installation

1. Clone the repository: `git clone https://github.com/raffael-87/github-email-exposer.git`
2. Navigate to the project directory: `cd github-email-exposer`
3. Install the dependencies: `npm install`

## Running the Application

To run the application in development mode: `npm run dev`

The application will be available at http://localhost:5173 (or another port if 5173 is in use).

## Building for Production

To create a production build: `npm run build`

The built files will be in the `dist` directory.

## Contributing

Pull requests are warmly welcomed and appreciated 🙂 

Please follow these steps:
1. Fork the repository.
2. Create a new branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project is licensed under the MIT License.

# GitHub E-Mail Exposer

## Description

GitHub E-Mail Exposer is a web application that allows you to find all e-mail addresses associated with a certain GitHub account. It retrieves event data from GitHub's public API to expose email addresses that are not explicitly hidden by users. These email adresses are public anyway, so nothing illegal is happening here 😎

## Features

- Search for GitHub users by username
- Display email addresses of the searched user and their collaborators
- Copy email addresses to clipboard with a single click
- Responsive design for various screen sizes
- 60 requests per hour for free

## Tech Stack Used

- React
- TypeScript
- Tailwind CSS
- Vite

I might add unit tests with Vitest on a later stage.

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

## Contact

You can find and message me on LinkedIn, so I know who you are 🧐
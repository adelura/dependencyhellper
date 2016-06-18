# Dependency Hellper

Are you using `npm link` command often? Have you ever lost track of which package is linked and where?
Do you want easily link or unlink some package in your project? This utility is for you.

## Installation

``` sh
$ npm install -g dependencyhellper
```

Then you will have `dh` option available in your command line interface.

## Commands

``` sh
$ dh [command] <flags...>
```

### list

Show all linked packages in your project

### link

Link chosen packages from available ones

### unlink

Unlink chosen packages from already linked ones

Flag `-a --all`: Unlink all linked packages
Flag `-r --replace`: Replace with original packages (npm install)

### reset

Unlink all linked packages and replace with original ones (npm install)
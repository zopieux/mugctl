# mugctl

Bloat-free web app for monitoring and controlling Ember Bluetooth mugs.

## Usage

[**Launch the app now**](https://zopieux.github.io/mugctl/), no installation required.

<img src=".github/screenshot.apng" align="right" height="512"/>

This requires a recent Chrome for Android, Firefox has no Bluetooth support. The page will prompt you to install the
website as a [pseudo-app](https://web.dev/install-criteria/), which I recommend accepting for convenience.

See [change log](CHANGELOG.md) for release notes.

## Rationale

The official Android application from Ember Technologies is a whopping 22 MB and requires creating an account to 
do anything useful. I despise these venture-funded startup practises. It's a shame, because the mug hardware itself is 
pretty cool and sleek, and while I would not buy such a gadget myself (this was a gift), I appreciate the convenience
of coffee that stays nice and warm.

There is no world in which you will get me to create an account to change literally 6 bytes on a Bluetooth device, so
I reverse-engineered the app and this is the result.

<br clear="both"/>

## Building from source

This is a very simple React application that uses a bunch of libraries:

    $ yarn install
    $ yarn run build

## License

MIT.

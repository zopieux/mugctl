# mugctl

Bloat-free web app for monitoring and controlling Ember Bluetooth mugs.

## Usage

[**Launch the app now**](https://zopieux.github.io/mugctl/), no installation required.

<img src=".github/screenshot.apng" align="right" height="512"/>

You'll be prompted to “install” this as a [progressive web app](https://web.dev/install-criteria/), which I recommend accepting for convenience – it adds a dedicated icon on your home screen.

mugctl requires a recent **Chrome** browser or derivative. Chrome on desktop
works, provided you have Bluetooth connectivity. Firefox sadly has
[no intention][fxbt] of implementing the required APIs, so it won't work.

See [change log](CHANGELOG.md) for release notes.

## Rationale

The official Android application from Ember Technologies is a whopping *60
megabytes* and requires creating an account to do anything useful, as seems to
be the business model of many venture capital funded statups these days. It's a
shame, because the mug hardware itself is pretty cool and sleek-looking. While I
would not buy such a gadget myself (this was a gift), I appreciate the
convenience of coffee that stays nice and warm.

There is no world in which you will get me to create an account to change
literally 6 bytes on a Bluetooth device, so I reverse-engineered the app and
this is webapp is the result. In a utopian world, this is what Ember
Technologies would have done themselves.

<br clear="both"/>

## Building from source

This is a very simple React application that uses a bunch of libraries:

    $ yarn install
    $ yarn run build

## License

MIT.

[fxbt]: https://mozilla.github.io/standards-positions/#web-bluetooth

# 2023-07-16

* Add “bond” button to avoid the annoying connection prompt each time the app is
  launched. This has no effect in the latest version of Chrome for Android, but
  seems to work on desktop.

# 2023-02-21

* Fix a bug when setting the temperature in Fahrenheit.

# 2023-02-17

* Add support for turning off the heater entirely. The last preferred target
  temperature is persisted to local device storage. Fixes issue #1.
* Use a fancier, graphical liquid level indicator, instead of a text. 
* Fix the liquid level computation, as per issue #3.
* Add a state icon, as per issue #3.

# 2023-02-16

* Add support for temperature unit. User can switch between Celsius and
  Fahrenheit. The setting is persisted in the mug. Fixes issue #2.

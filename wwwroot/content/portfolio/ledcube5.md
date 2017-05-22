The 5x5x5 LED cube was my first large hardware project. I constructed the cube out of 5mm blue LEDs and wired it together with Cat5 cable. 

The hardware consisted of a 5v PIC18F45K22 MCU driving Cat4016 constant current LED drivers. The cube was broken up into 5 layers of 25 LEDs, where a single refresh cycle would multiplex the rows and give the eye a persistence of vision effect. 

The cube can print text, do a wave animation and more. The software was written in embedded C on the PIC MCU. 

This project served as a basis for the (currently) on-going 8x8x8 Cube I am working on.
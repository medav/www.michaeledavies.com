The array consists of 512 blue LEDs soldered together from scratch. The fixture was made from Lego parts and wired together with spare Cat5 ethernet cable. 

A Raspberry Pi is used to render frames for the array. The frame data is then piped over UART connection at 115200 baud to a PIC18LF45K22 MCU that acts as a display buffer. The PIC reads the frames from the UART asynchronously through interrupts. The incoming data is stored in a back buffer untill one whole frame is read. This effectively creates a double buffered system that prevents frame tearing. 

I wrote a front end API interface for C++ as well as Python allowing users of my API to easily interface with the Display. The API essentially holds its own frame buffer that client applications can write to, then transmits the frames on command. The benefit is that it provides a layer of abstraction that hides the way the frame data is packed into a byte array. This way, applications only need to address LEDs in an (x, y, z) manner. 

Check out a more detailed description of the cube's construction and design [here](medav.github.io/ledcube).
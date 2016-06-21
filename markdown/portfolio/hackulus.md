The Hackulus Rift was envisioned by Thomas Moll. During HackISU, I worked with Tom to develop a hack atop this platform to allow Leap motion integration. 

The Hackulus Rift is a makeshift VR headset using common materials, 2 lenses, and a Nexus 7 Tablet. Our hack consisted of rigging a server (PC) running a node.js webserver with a Leap Motion attached to it. 

When the Nexus 7 loaded the page, we used socket.io to pipe leap motion data from the server to the tablet. We combined this information with the accelerometer data on the tablet to render a 3D stereo view of the virtual world where the user's hands could be seen. The setup took 24 hours to put together.
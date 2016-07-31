# Obscure Problem \#1

## Installation of WDF breaks some includes of cl.exe (most notably, corecrt.h) when using the Visual Studio Command Prompt tool.

In my case, I use a simple PowerShell script to apply all the environment variables set by VSCP to my shell environment using the PS profile. This way I can use a regular old PowerShell opened from anywhere to do command line building. Still, this method depends on the variables VSCP does and so when it broke, I could not build things via cl.exe.

When compiling a simple test application I received the following error can couldn't seem to figure out why (since I had successfully tried this on a different computer) the "corecrt.h" header wasn't being found.

~~~batch
PS > cl .\hello_win.cpp
Microsoft (R) C/C++ Optimizing Compiler Version 19.00.23026 for x86
Copyright (C) Microsoft Corporation.  All rights reserved.

hello_win.cpp
C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\INCLUDE\crtdefs.h(10): fatal error C1083: Cannot open include file: 'corecrt.h': No such file or directory
~~~

# Cause of problem
This problem involves these two `files`:

C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC\bin\vcvars32.bat
C:\Program Files (x86)\Microsoft Visual Studio 14.0\Common7\Tools\vcvarsqueryregistry.bat

the following `directory`:

C:\Program Files (x86)\Windows Kits\10\Include

And the `Windows Driver Framework` (WDF)

When the environment for VSCP is setup, it "sources" `vcvars32.bat` to setup all the variables to be able to call cl.exe, csc.exe, and other tools from the shell. vcvars32.bat sources another batch file, `VCVarsQueryRegistry.bat` which sets up additional variables. In VCVarsQueryRegistry.bat, There is the following code to detect the Windows SDK version (set as `%WindowsSDKVersion%`):

~~~batch
51: @REM Get windows 10 sdk version number
52: @if not "%WindowsSdkDir%"=="" @FOR /F "delims=" %%i IN ('dir "%WindowsSdkDir%include\" /b /ad-h /on') DO @set WindowsSDKVersion=%%i\
53: @if not "%WindowsSDKVersion%"=="" @SET WindowsSDKLibVersion=%WindowsSDKVersion%
~~~

On line 52, there is a for loop that essentially results in setting %WindowsSdkDir% to be the last folder in "%WindowsSdkDir%include\" returned by the for loop. If the Windows Driver Framework were not installed, it would choose the last Window build (`10.0.10586.0`, at the time of writing this), but since the folder for `wdf` came after "10.0.10586.0", it chose that instead. So %WindowsSdkDir% is then incorrect, and the rest of the variable set using that in vcvars32.bat are broken:

~~~batch
24: @rem
25: @rem Set Windows SDK include/lib path
26: @rem
27: @if not "%WindowsSdkDir%" == "" @set PATH=%WindowsSdkDir%bin\x86;%PATH%
28: @if not "%WindowsSdkDir%" == "" @set INCLUDE=%WindowsSdkDir%include\%WindowsSDKVersion%shared;%WindowsSdkDir%include\%WindowsSDKVersion%um;%WindowsSdkDir%include\%WindowsSDKVersion%winrt;%INCLUDE%
29: @if not "%WindowsSdkDir%" == "" @set LIB=%WindowsSdkDir%lib\%WindowsSDKLibVersion%um\x86;%LIB%
30: @if not "%WindowsSdkDir%" == "" @set LIBPATH=%WindowsLibPath%;%ExtensionSDKDir%\Microsoft.VCLibs\14.0\References\CommonConfiguration\neutral;%LIBPATH%
~~~

# My Solution
I have not come up with a solution that preserves all functionality yet, but here is what I did to fix this:

In directory "C:\Program Files (x86)\Windows Kits\10\Include" (Resolved from %WindowsSdkDir%include\), Rename the folder "wdf" to "_wdf"

## Consequences
This will more than likely break driver development. Since I have not done any (yet) I don't need that to work, and I will always know how to change it back if need be.


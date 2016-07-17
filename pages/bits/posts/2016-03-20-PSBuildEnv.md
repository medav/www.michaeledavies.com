---
layout: post
title: "Using PowerShell for Command Line Building"
date: 2016-03-20
categories: guides
---

# Introduction and Motivation
The first time a student is exposed to C and C++ is often on Linux using GNU's gcc compiler or on an emulator of bash called Cygwin. GNU’s gcc offers a simple one step process to compile a program.
 
This is all well in good, but it teaches only the syntax and usage of gcc and POSIX systems and doesn't expose beginning programmers to other platforms (namely, Windows). The unfortunate truth is that most Linux distributions (and Cygwin) come already set up to do development – a lot more easily than Windows. The purpose of this guide is to show a programmer how to set up Windows PowerShell to provide similar tools to gcc on Linux. 

# Prerequisites
-	(Required) Windows 8, 8.1, or 10
-	(Required) Visual Studio Community Edition
-	(Required) Visual Studio Code
-	(Optional) Git for Windows Extensions

# Setting up the PowerShell Profile
First, if you haven't already, you will need to set PowerShell to allow scripts to run. Open PowerShell as Administrator and use,

~~~ps
PS> Set-ExecutionPolicy RemoteSigned 
~~~

PowerShell conveniently tells you the location of its profile by setting the $profile variable. You will need to create the directory for it, first, then open it with code.

~~~ps
PS> mkdir $(Split-Path $profile)


    Directory: ...


Mode                LastWriteTime         Length Name
----                -------------         ------ ----
d-----        mm/dd/yyyy   hh:mm AM              WindowsPowerShell


PS> code $profile
~~~

The following script, obtained from [here](http://allen-mack.blogspot.com/2008/03/replace-visual-studio-command-prompt.html) will run the Visual Studio variable setup script in your PowerShell environment.

~~~ps
#Set environment variables for Visual Studio Command Prompt
pushd 'C:\Program Files (x86)\Microsoft Visual Studio 14.0\VC'
cmd /c "vcvarsall.bat x64&set" |
foreach {
  if ($_ -match "=") {
    $v = $_.split("="); set-item -force -path "ENV:\$($v[0])"  -value "$($v[1])"
  }
}
popd
write-host "`nVisual Studio 2015 Command Prompt variables set." -ForegroundColor Yellow
~~~

# Using the Environment
Let’s consider the following simple “Hello, World!” program for C++:
 
~~~C++
#include <iostream>

int main() {
	std::cout << "Hello, World!" << std::endl;
	return 0;
}
~~~

To create and compile this, open a new file "hello.cpp" and enter the above program into it.

When finished, compile and run from PowerShell with 

~~~ps
PS> cl /EHsc hello.cpp
Microsoft (R) C/C++ Optimizing Compiler Version 19.00.23506 for x64
Copyright (C) Microsoft Corporation.  All rights reserved.

hello.cpp
Microsoft (R) Incremental Linker Version 14.00.23506.0
Copyright (C) Microsoft Corporation.  All rights reserved.

/out:hello.exe
hello.obj
PS> .\hello.exe
Hello, World!
~~~


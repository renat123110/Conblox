' Conblox Studio Silent Launcher (No Console Window)
Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
strDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strDir

' Launch server.pyw with window style 0 (completely hidden, no CMD window)
WshShell.Run "pythonw """ & strDir & "\server.pyw""", 0, False

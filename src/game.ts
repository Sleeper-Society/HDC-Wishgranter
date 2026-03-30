import fs from 'fs'
import { Mod } from "./mod.ts";
import { AddCard, AddEncounter, AddStartingDeck, AddKeyword, AddDongle } from './mod_menu/parse_code0.ts';
import { app, BrowserWindow, ipcMain } from 'electron';

export class Game {
  public modlist: Mod[];
  private window : BrowserWindow
  public AddCard = AddCard
  public AddEncounter = AddEncounter
  public AddStartingDeck = AddStartingDeck
  public AddKeyword = AddKeyword
  public AddDongle = AddDongle
  constructor(main_window : BrowserWindow, modlist : Mod[]){
    this.window = main_window
    this.modlist = modlist
  }
  loadScript(script_source : fs.PathLike) : Promise<void>{
    const promise = new Promise<void>((resolve) => ipcMain.handleOnce(script_source + '_loaded', () => resolve()));
    this.window.webContents.send('add_script', script_source)
    return promise
  }
  getTempDirectory() : string{
    return app.getPath('temp')
  }
  startGame() : void {
    this.window.webContents.send('start_game', this.modlist.filter((value) => value.gamestart).map((value) => value.gamestart))
  }
}


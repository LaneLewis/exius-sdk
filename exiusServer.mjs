import {createClient} from "webdav"
import { Buffer } from 'buffer';
import fetch from "node-fetch"
// add abstraction layer for actual server or local
//add remove directory
export class ExiusServer {
    constructor(url, key){
        this.url = url
        this.key = key 

        this.addKey = this.addKey.bind(this)
        this.deleteKey = this.deleteKey.bind(this)
        this.getChildKeys = this.getChildKeys.bind(this)

        this.mkDir = this.mkDir.bind(this)
        this.readFile = this.readFile.bind(this)
        this.copyFile = this.copyFile.bind(this)
        this.moveFile = this.moveFile.bind(this)
        this.deleteFile = this.deleteFile.bind(this)
        this.lsDir = this.lsDir.bind(this)
        this.doesResourceExist = this.doesResourceExist.bind(this)
        this.writeFile = this.writeFile.bind(this)
        this.checkEndpoint = this.checkEndpoint.bind(this)
        this.client = createClient(url+"/files/",{
            username:"",
            password:key.KeyValue
        })
    }
    static async init(url, keyValue){
        try{
            let key = await getKey(url, keyValue)
            return new ExiusServer(url, key)
        }
        catch(e){
            throw e
        }
    }
    async addKey(params){
        try{
            let res = await fetch(this.url+"/addKey", {
                method: 'POST',
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(":" + this.key.KeyValue,"utf8").toString("base64")
                },
                body: JSON.stringify(params)
              })
            if (res.status == 201 || res.status == 200){
                return await res.json()
            }
            else{
                throw Error(res.status)
            }
        }catch(e){
            errorHandler(e)
        }
    }
    async deleteKey(){
        try{
            let res = await fetch(this.url+"/deleteKey", {
                method: 'POST',
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(":" + this.key.KeyValue,"utf8").toString("base64")
                }
              })
              if (res.status == 200){
                  return true
              }else{
                  throw Error(res.status)
              }
        }catch(e){
            errorHandler(e)
        }
    }
    async getChildKeys(){
        try{
            let res = await fetch(this.url+"/getChildKeys", {
                method: 'POST',
                headers: {
                  'Accept': 'application/json, text/plain, */*',
                  'Content-Type': 'application/json',
                  'Authorization': 'Basic ' + Buffer.from(":" + this.key.KeyValue,"utf8").toString("base64")
                }
              })
              if (res.status == 200 || res.status == 201){
                  return res.json()
              }else{
                  throw Error(res.status)
              }
        }catch(e){
            errorHandler(e)
        }
    }
    async mkDir(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            await this.client.createDirectory("/"+endpoint+"/"+path, {recursive:true})
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    async readFile(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.getFileContents("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    async copyFile(endpoint, fromPath, toPath){
        try{
            this.checkEndpoint(endpoint)
            await this.client.copyFile("/"+endpoint+"/"+fromPath, "/"+endpoint+"/"+toPath)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    async moveFile(fromPath, toPath){
        try{
            this.checkEndpoint(endpoint)
            await this.client.moveFile("/"+endpoint+"/"+fromPath, "/"+endpoint+"/"+toPath)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    async deleteFile(endpoint,path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.deleteFile("/"+endpoint+"/"+path)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    async lsDir(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.getDirectoryContents("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    async doesResourceExist(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.exists("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    async writeFile(endpoint, path, content){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.putFileContents("/"+endpoint+"/"+path, content,{contentLength:false, overwrite:true})
        }catch(e){
            errorHandler(e)
        }
    }
    async checkEndpoint(endpoint){
        if (!Object.keys(this.key.Endpoints).includes(endpoint)){
            throw Error("endpoint not in key endpoints")
        }
        return true
    }
}
function errorHandler(e){
    if (e.message == "404"){
        throw Error(`Server Not Found: Check that your server is up and 
        you entered the server in correctly in your config`)
    }
    else if (e.message == "401"){
        throw Error(`Invalid Credentials: Make sure that your config 
        key is valid, that the key you are trying to access exists, 
        and that it has less permissions than the key you are trying to 
        access it with`)
    }else{
        throw e
    }
}

export async function getKey(url, key){
    try{
        let res = await fetch(url+"/getKey", {
            method: 'POST',
            headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + Buffer.from(":" + key,"utf8").toString("base64")
            },
        })
        if (res.status == 201 || res.status == 200){
            return await res.json()
        }else{
            throw Error(res.status)
        }
    }catch(e){
        if (e.message == "404"){
            throw Error(`Server Not Found: Check that your server is up and 
            you entered the server in correctly in your config`)
        }
        else if (e.message == "401"){
            throw Error(`Invalid Credentials: Make sure that your config 
            key is valid, that the key you are trying to access exists, 
            and that it has less permissions than the key you are trying to 
            access it with`)
        }else{
            throw e
        }
    }
}
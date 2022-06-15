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
    /**
     * Establishes a connection to an exius server
     * @constructor 
     * @param {string} url - url of exius server
     * @param {string} keyValue - key to use as the "user" when doing operations
     * @returns {ExiusServer}
     */
    static async init(url, keyValue){
        try{
            let key = await getKey(url, keyValue)
            return new ExiusServer(url, key)
        }
        catch(e){
            throw e
        }
    }
    /**
     * @param {object} params 
     * @param {bool} params.CanCreateChild - can created key make new keys 
     * @param {string} params.InitiateExpire - 
     * @param {number} params.ExpireDelta
     * @param {object} params.Endpoints
     * @param {string} params.Endpoints.[endpoint:string].Path - relative file path for endpoint
     * @param {number=2147483647} params.Endpoints.[endpoint:string].[MaxMkcol] - maximum number of allowed Mkcol ops from added key endpoint
     * @param {number=2147483647} params.Endpoints.[endpoint:string].[MaxPut] - maximum number of allowed Put ops from added key endpoint
     * @param {number=9223372036854775807} params.Endpoints.[endpoint:string].[MaxPutSize] - maximum byte size of Put op from added key endpoint
     * @param {number=2147483647} params.Endpoints.[endpoint:string].[MaxGet=2147483647] - maximum number of Get ops from added key endpoint
     * @param {Array{string}=["any"]} params.Endpoints.[endpoint:string].[PutTypes] - types allowed to be uploaded, can be any any standard encoding or any
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Copy] - is Copy webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Delete] - is Delete webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Get] - is Get webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Head] - is Head webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Lock] - is Lock webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Mkcol] - is Mkcol webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Move] - is Move webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Options] - is Options webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Post] - is Post webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Propfind] - is Propfind webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Put] - is Put webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Trace] - is Trace webdav operation allowed
     * @param {boolean=false} params.Endpoints.[endpoint:string].[Unlock] - is Unlock webdav operation allowed
     * @returns {object}
     */
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
    /**
     * deletes key
     * @returns {boolean} - was key deleted successfully
     */
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
    /**
     * gets the relative paths of all child keys which are defined as having 
     * less or equal webdav permissions on the or subsets of the same directories. They 
     * are returned along with a list of their endpoint's relative paths from an 
     * endpoint owned by the key. 
     * @returns {object}
     */
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
    /**
     * makes a directory using this key off of owned endpoint via a relative path
     * @param {string} endpoint - endpoint owned by this key
     * @param {string} path - relative path from endpoint to make directory on
     * @returns {boolean}
     */
    async mkDir(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            console.log(await this.client.createDirectory("/"+endpoint+"/"+path, {recursive:true}))
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * reads file from key's owned endpoint's relative path and returns it as a string/buffer
     * @param {string} endpoint - endpoint owned by this key 
     * @param {string} path - relative path from endpoint to read file from
     * @returns {string | Buffer}
     */
    async readFile(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.getFileContents("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint - endpoint owned by this key
     * @param {string} fromPath - relative path from endpoint to copy from
     * @param {string} toPath  - relative path from endpoint to copy to
     * @returns {boolean}
     */
    async copyFile(endpoint, fromPath, toPath){
        try{
            this.checkEndpoint(endpoint)
            await this.client.copyFile("/"+endpoint+"/"+fromPath, "/"+endpoint+"/"+toPath)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * @param {string} endpoint - endpoint owned by this key
     * @param {string} fromPath - relative path from endpoint to move from
     * @param {string} toPath - relative path from endpoint to move to
     * @returns {boolean}
     */
    async moveFile(endpoint, fromPath, toPath){
        try{
            this.checkEndpoint(endpoint)
            await this.client.moveFile("/"+endpoint+"/"+fromPath, "/"+endpoint+"/"+toPath)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint - endpoint owned by this key
     * @param {string} path - relative path from endpoint to file to delete
     * @returns {boolean}
     */
    async deleteFile(endpoint,path){
        try{
            this.checkEndpoint(endpoint)
            await this.client.deleteFile("/"+endpoint+"/"+path)
            return true
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint - endpoint owned by this key
     * @param {string} path - relative path from endpoint to the directory to be listed
     * @returns {Array{FileStat}}
     */
    async lsDir(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.getDirectoryContents("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint 
     * @param {string} path 
     * @returns 
     */
    async doesResourceExist(endpoint, path){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.exists("/"+endpoint+"/"+path)
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint 
     * @param {string} path 
     * @param {string} content 
     * @returns 
     */
    async writeFile(endpoint, path, content){
        try{
            this.checkEndpoint(endpoint)
            return await this.client.putFileContents("/"+endpoint+"/"+path, content,{contentLength:false, overwrite:true})
        }catch(e){
            errorHandler(e)
        }
    }
    /**
     * 
     * @param {string} endpoint 
     * @returns 
     */
    async checkEndpoint(endpoint){
        if (!Object.keys(this.key.Endpoints).includes(endpoint)){
            throw Error("endpoint not in key endpoints")
        }
        return true
    }
}
/**
 * Generic error handler used by all functions to explain 404 and 401
 * @param {Error} e 
 */
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
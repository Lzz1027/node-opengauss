const Client = require('./core/client')

const OpenGauss = class {
    constructor() {
        // 数据库连接对象
        this._connection = null
        // 驱动客户端
        this.Client = Client
        this.Query = Client.Query
    }
    /**
     * 连接数据库及登录功能
     *
     * config.username {string} 用户名
     * config.dbname {string} 数据库名称
     * config.host 主机名，默认 localhost
     * config.port 端口号，默认5432
     * config.password {string} 密码
     */
    async connect(config, callback=()=>{}) {
        if (this.client) throw new Error('连接已建立')
        if (config.username) config.user = config.username
        if (config.dbname) config.database = config.dbname
        this.client = new this.Client(config)
        this.client.connect()
            .then(res => {callback(res, "success")})
            .catch(err => {callback(err, "failed") })
        return this.client
    }
    // SQL语句执行功能
    query(sql, callback = () => { }) {
        // const timeStart = Date.now()
        this.client.query(sql, (err, res) => {
            if (err) {
              callback(err, 'error')
            } else {
              callback(res, 'success')
            }
            // 记录 SQL 执行用时
            // console.log(`SQL \`${ sql }\` finished in ${ Date.now() - timeStart }ms`)
        })
    }
    // TODO
    // 撤销当前执行的SQL语句（并不保证100%撤销成功）
    cancel(callback) {
        try {
            callback(null, true)
        } catch (err) {
            callback(err)
        }
    }
    // 断开连接
    disconnect(callback = () => { }) {
        try {
            callback(null, true)
            return this.client.end()
        } catch (err) {
            callback(err)
        }
    }
}

// TODO
// 会话管理与并发控制功能（连接池）
OpenGauss.Pool = class {
    constructor() {
        // 连接池，这里用数组实现
        this._connections = []
    }

    connect() {
        const { connection } = new Client()
        for (const key in connection) {
            if (key.startsWith('_')) delete connection[key]
            if (key === 'lastBuffer') delete connection[key]
            if (key === 'parsedStatements') delete connection[key]
            if (key === 'ssl') delete connection[key]
        }
        this._connections.push({
            connection,
            status: 1
        })
    }

    snapshot() {
        console.log(this._connections)
    }
}

module.exports = OpenGauss
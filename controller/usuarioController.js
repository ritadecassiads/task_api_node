const usuarioModel = require('../models/usuarioModel')
const tarefaModel = require('../models/tarefaModel')
class UsuarioController{
    async cadastrar(req, res){
        const usuario = req.body

        // gerador de id
        const obj = await usuarioModel.findOne({}).sort({'idUsuario': -1});  // encontra um, faz o sort para ordenar 1 crescente e -1 decrescente       
        usuario.idUsuario = obj == null ? 1 : obj.idUsuario + 1; // quando for o primeiro o id será 1, após isso será sempre id+1
        
        usuario.logado = false // ser criado como false por padrao

        // importa a tarefaModel, encontro o id dela e comparo com o id que mandei no body da requisição
        const tarefa = await tarefaModel.findOne({'idTarefa': usuario.tarefa})
        usuario.tarefa = tarefa

        const resultado = await usuarioModel.create(usuario)
        res.send({
            message: "Usuario cadastrado com sucesso!",
            usuario: resultado
        }) 
    }

    async login(req, res){
        const { username, senha } = req.body
        const usuario = await usuarioModel.findOne({'username': username, 'senha': senha})

        if(usuario){
            usuario.logado = true
            res.json({
                message: "Usuario logado!"
            })
        } else {
            res.json({
                message: "Usuario não cadastrado!"
            })
        }
    }

    async listar(req, res){
        const usuarios = await usuarioModel.find({})
        res.json(usuarios)
    }

    async buscarPorId(req, res){
        const id = req.params.id
        const usuario = await usuarioModel.findOne({'idUsuario': id})
        res.json(usuario)
    }

    // atualiza informacoes do usuario
    async atualizar(req, res){
        const id = req.params.id // id vindo dos parametros da requisição
        const usuario = req.body // alteração vindo do body da requisição

        const tarefa = await tarefaModel.findOne({'idTarefa': usuario.tarefa})
        usuario.tarefa = tarefa

        const _id = (await usuarioModel.findOne({'idUsuario' : id}))._id; // compara o id do usuario com o id passado na requisição e retorna o _id criado automaticamente no mongo
        await usuarioModel.findByIdAndUpdate(String(_id), usuario) // atualize usuario do _id com a informacoes 'usuario' que veio do body
        res.send({
            message: "Usuario atualizado com sucesso!"
        })
    }

    // add tarefa a um usuario por id, posso mandar um array de tarefas
    async addTarefa(req, res){
        const id = req.params.id // id vindo dos parametros da requisição
        const body = req.body // tarefa vindo do body da requisição

        const tarefa = await tarefaModel.find({'idTarefa' : body.tarefa})
        const usuario = await usuarioModel.findOne({'idUsuario' : id})
        const _id = usuario._id
        
        const usuarioAtualizado = await usuarioModel.findByIdAndUpdate(_id, {$push: {tarefa: tarefa}}, 
            {upsert: true, new: true}) // encontro usuario pelo id e dou um push, passando o nome do campo e o elemento que será incluido
            
        res.send({
            message: "Tarefa adicionada a lista do usuario com sucesso!",
            usuario: usuarioAtualizado
        })

        // verificar se a tarefa já existe na lista do usuario
        // if(tarefa.idTarefa == usuario.tarefa.idTarefa){
        //     console.log(tarefa.idTarefa + "     TESTE   " + usuario.tarefa.idTarefa)
        //     return res.send({
        //         message: "Essa tarefa já foi adicionada a lista!"
        //     })
        // } else {
        //     const usuarioAtualizado = await usuarioModel.findByIdAndUpdate(_id, {$push: {tarefa: tarefa}}, 
        //         {upsert: true, new: true})
           
        //     res.send({
        //         message: "Tarefa adicionada a lista do usuario com sucesso!",
        //         usuario: usuarioAtualizado
        //     })
        // }
    }

    async excluir(req, res){
        const id = req.params.id
        const _id = (await usuarioModel.findOne({'idUsuario' : id}))._id;
        await usuarioModel.findByIdAndDelete(String(_id))
        res.send({
            message: "Usuario excluído!"
        })
    }
}

module.exports = new UsuarioController()
import { Router } from 'express'
import {saveFile} from '../awsinteractios/awsinit'
import {parseUser} from './helpers'
// import { runInNewContext } from 'vm'
import {createProject, getProjects, getCategorys} from '../modules/proyectos'
import {createEstimulo, getEstimulo, getOneEstimulus} from '../modules/estimulos'
import {createUser} from '../modules/users'
import { cassInsertDB } from '../db/dbConsult'

export const appRouter = Router()

appRouter.post('/addMultimedia', async (req, res) => {
  const { filetype, name } = req.body
  if (!filetype || !name) {
    res.status(400).end()
    return
  }
  const url = await saveFile(`proyecto/${name}`, filetype)
  res.json(url)
})

// appRouter.use(async (req, res, next) => {
//   try {
//     await parseUser(id)
//     next()
//   } catch (error) {
//     console.log({error})
//     if (error.code === 'auth/argument-error') {
//       res.sendStatus(401)
//       return
//     }
//     res.sendStatus(400)
//   }
// })
// administracion user request
appRouter.get('/getProjects', async (req, res) => {
  const {id} = req.headers
  try {
    if (!id) {
      // res.status(400).end()
      res.status(400).send('id undefiined')
      return
    }
    const userInfo = await parseUser(id)
    const result = await getProjects(userInfo)
    res.json(result)
  } catch (error) {
    console.log({error})
    if (error.code === 'auth/argument-error') {
      res.sendStatus(401)
      return
    }
    console.log({error})
    res.sendStatus(400)
  }
})

appRouter.get('/getCategorys', async (req, res) => {
  try {
    console.log('hello world')
    const result = await getCategorys()
    res.json(result)
  } catch (error) {
    console.log({error})
    if (error.code === 'auth/argument-error') {
      res.sendStatus(401)
      return
    }
    console.log({error})
    res.sendStatus(400)
  }
})
appRouter.post('/addProjects', async (req, res) => {
  try {
    const {id, projectPayload} = req.body
    console.log(projectPayload)
    // res.send('result')
    const userInfo = await parseUser(id)
    await createProject(userInfo, projectPayload)
    const result = await getProjects(userInfo)
    res.send(result)
  } catch (error) {
    console.log({error})
    if (error.code === 'auth/argument-error') {
      res.sendStatus(401)
      return
    }
    res.sendStatus(400)
  }
})
// users endpoints
appRouter.post('/addUsers', async (req, res) => {
  const { uid, email } = req.body
  try {
    const result = await createUser(uid, email)
    res.send(result)
  } catch (error) {
    console.log(400)
    console.log(error)
    res.sendStatus(400)
  }
})

appRouter.post('/addStimulus', async (req, res) => {
  const { projectid, estimulo } = req.body
  try {
    console.log(projectid, estimulo)
    await createEstimulo(projectid, estimulo)
    const result = await getEstimulo(projectid)
    // console.log(result)
    res.send(result)
  } catch (error) {
    console.log(400)
    console.log(error)
    res.sendStatus(400)
  }
})

appRouter.get('/getStimulus', async (req, res) => {
  const {projectid} = req.headers
  try {
    if (!projectid) {
      // res.status(400).end()
      res.status(400).send('id undefiined')
      return
    }
    // const userInfo = await parseUser(id)
    const result = await getEstimulo(projectid)
    res.json(result)
  } catch (error) {
    console.log({error})
    if (error.code === 'auth/argument-error') {
      res.sendStatus(401)
      return
    }
    console.log({error})
    res.sendStatus(400)
  }
})
appRouter.get('/getOneStimulus', async (req, res) => {
  const {estimuloid} = req.headers
  try {
    if (!estimuloid) {
      // res.status(400).end()
      res.status(400).send('id undefiined')
      return
    }
    // const userInfo = await parseUser(id)
    const result = await getOneEstimulus(estimuloid)
    // res.json(result)
    res.json(result)
  } catch (error) {
    console.log({error})
    if (error.code === 'auth/argument-error') {
      res.sendStatus(401)
      return
    }
    console.log({error})
    res.sendStatus(400)
  }
})

appRouter.post('/addInformante', async (req, res) => {
  const {comments, userid, estimuloid} = req.body
  try {
    const query = 'INSERT INTO analyzer.informante (estimulo_id , infor_id , answers ) VALUES (?, ?, ?)'
    await cassInsertDB(query, [estimuloid, userid, JSON.stringify(comments)])
    // comments.forEach((element) => console.log(Math.round(element.momento)))
    res.sendStatus(200)
  } catch (error) {
    console.log(error)
  }
})

export const validateSchemas = (schema) => (req, res, next)=>{
  try {
      schema.parse(req.body); //Analiza el esquema contra lo que contiene req.body
      next(); //Si no hay error en el esquema se ejecuta next
  } catch (error) {
      console.log(error)
      return res.status(400).json({
          message: error.issues.map(  (error) => error.message)
      })
  } // Fin del catch
} //Fin de validateSchema
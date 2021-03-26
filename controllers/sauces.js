const Sauces = require('../models/Sauces');
const fs = require('fs');

exports.createSauces = (req, res, next) => {
  const saucesObject = JSON.parse(req.body.sauce);
  delete saucesObject._id;
  const sauces = new Sauces({
    ...saucesObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  });
  sauces.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistré !'}))
    .catch(error =>
       res.status(400).json({ error })
    );
};

exports.getOneSauces = (req, res, next) => {
  Sauces.findOne({
    _id: req.params.id
  }).then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(404).json({
        error: error
      });
    }
  );
};

exports.modifySauces = (req, res, next) => {
  const saucesObject = req.file ?
    {
      ...JSON.parse(req.body.sauces),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauces.updateOne({ _id: req.params.id }, { ...saucesObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifié !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauces = (req, res, next) => {
  Sauces.findOne({ _id: req.params.id })
    .then(sauces => {
      const filename = sauces.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauces.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimé !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.getAllSauces = (req, res, next) => {
  Sauces.find().then(
    (sauces) => {
      res.status(200).json(sauces);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.likeSauces = (req, res, next) => {
  Sauces.findOne({
    _id: req.params.id
  }).then(
    (sauces) => {
      if (req.body.like == 1){
        sauces.likes += 1;
        sauces.usersLiked.push(req.body.userId);
      }
      else if (req.body.like == -1){
        sauces.dislikes += 1;
        sauces.usersDisliked.push(req.body.userId);
      }
      else if (req.body.like == 0){
        if (sauces.usersLiked.some(userId => req.body.userId == userId)){
          sauces.likes -= 1;
          sauces.usersLiked = sauces.usersLiked.filter(userId => req.body.userId != userId);
        }
        else{
          sauces.dislikes -= 1;
          sauces.usersDisliked = sauces.usersDisliked.filter(userId => req.body.userId != userId);
        }
      }
      sauces.save()
      .then(() => res.status(200).json({ message: 'Like ajouté !'}))
      .catch(error => res.status(400).json({ error }));
    })
};
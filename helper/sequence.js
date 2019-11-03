const { Sequence } = require('../model/pdv-dm-sequence');

async function next(model) {
    let sequence = await Sequence.findOne({ name: model.modelName });
    let value = 0;

    if (!sequence) 
        sequence = new Sequence({ name: model.modelName, current: 1 });

    value = sequence.current + 1;
    sequence.current = value;
    await sequence.save();

    return value;
}

module.exports.next = next;
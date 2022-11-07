import { Router } from "express";
import Rule from "../../db/Rule.js";

const router = Router();

router.get("/", async (req, res) => {
  const rules = await Rule.getAll();
  res.json(rules);
});

router.get("/:id", async (req, res, next) => {
  if (req.params.id.startsWith("channel")) {
    next();
  } else {
    const rule = await Rule.get(req.params.id);
    if (rule) {
      res.json(rule);
    } else {
      res.status(404).json({ error: "Rule not found" });
    }
  }
});

router.get("/channel", async (req, res) => {
  console.log("req.query.name", req.query.name);
  const rule = await Rule.getByChannel(req.query.name);
  if (rule) {
    res.json(rule);
  } else {
    res.status(404).json({ error: "Rule not found" });
  }
});

router.post("/", async (req, res) => {
  const rule = req.body;

  const newRule = await Rule.add(rule);

  if (!(newRule instanceof Error)) {
    res.json({ message: "Rule saved", id: newRule.id });
  } else {
    res.status(400).json({ message: "Rule not saved", error: newRule.message });
  }
});

router.delete("/:id", async (req, res, next) => {
  if (req.params.id.startsWith("channel")) {
    next();
  } else {
    const { id } = req.params;
    const feedBack = await Rule.delete(id);
    if (feedBack instanceof Error) {
      res
        .status(400)
        .json({ message: "Rule not deleted", error: feedBack.message });
    } else {
      res.json({ message: "Rule deleted" });
    }
  }
});

router.delete("/channel", async (req, res) => {
  const { name } = req.query;
  const feedBack = await Rule.deleteByChannel(name);
  if (feedBack instanceof Error) {
    res
      .status(400)
      .json({ message: "Rule not deleted", error: feedBack.message });
  } else {
    res.json({ message: "Rule deleted" });
  }
});

export default router;

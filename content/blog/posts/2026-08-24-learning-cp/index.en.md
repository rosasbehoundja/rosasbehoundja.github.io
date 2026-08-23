---
title: Learning Constraint Programming
date: 2026-08-24
description: An introduction to constraint programming, with key definitions, learning resources, use cases, scaling limits, and approaches combining learning with search.
---

Hi, dear reader!

I hear you want to learn constraint programming. :)

> **TL;DR:** This article introduces constraint programming and provides
> a list of resources for learning it. Jump to [the resources](#resources)
> if you want to skip the definitions.

## What Is a Combinatorial Problem?

A combinatorial problem involves selecting, arranging, grouping, or assigning
objects from a finite set while respecting a collection of conditions or
constraints. [ScienceDirect](https://www.sciencedirect.com/topics/computer-science/combinatorial-problem)

A candidate solution is any combination of the problem's components that may
be considered during the search. A valid solution is a candidate that satisfies
all the required conditions.

For a more detailed introduction, see
[Introduction: Combinatorial Problems and Search, page 4, by Holger H. Hoos and Thomas Stützle](https://www.cs.ubc.ca/~hoos/SLS-Book/Slides/Chapter-1/ch1-slides-2p.pdf).

Combinatorial problems arise in many areas of computer science and in
real-world applications, including:

- finding the shortest or cheapest round trip, as in the travelling salesperson problem (TSP);
- finding models of propositional formulae, as in Boolean satisfiability problems (SAT);
- planning, scheduling, and timetabling;
- routing data packets over the internet;
- predicting protein structures.

## What Is Combinatorial Optimisation?

Combinatorial optimisation is concerned with finding the best solution among
a finite, and often extremely large, set of alternatives.

A solution must first satisfy the problem's constraints. Among all feasible
solutions, we then look for one that minimises or maximises an objective
function, such as cost, distance, time, or profit.

This field lies at the intersection of mathematics, computer science, and
operations research. Its goal is not only to design efficient algorithms, but
also to determine or certify the quality of the solutions they produce.

For further definitions, see the resources from
[EPFL](https://www.epfl.ch/labs/disopt/teaching/page-31586-en-html/page-10545-en-html/)
and [DeepAI](https://deepai.org/machine-learning-glossary-and-terms/combinatorial-optimization).

Applications of combinatorial optimisation include:

- logistics and supply-chain optimisation;
- airline network design;
- taxi and ride allocation;
- package-delivery planning;
- assigning jobs to people;
- designing water-distribution networks;
- earth-science problems such as reservoir flow-rate optimisation.

## What Is Constraint Programming? Finally!

Constraint programming (CP) is a paradigm for solving combinatorial problems
by describing:

- the variables involved in the problem;
- the possible values, or domains, of those variables;
- the constraints that valid solutions must satisfy;
- optionally, an objective to minimise or maximise.

Instead of describing a sequence of instructions for constructing a solution,
we describe the properties that a solution must have. A constraint solver then
uses techniques such as constraint propagation and search to find one or more
solutions.

CP can therefore be used for both constraint-satisfaction and optimisation
problems.

For additional definitions, see
[Gurobi](https://www.gurobi.com/resources/faq/constraint-programming)
and [SINTEF](https://www.sintef.no/en/digital/departments/mathematics-and-cybernetics/optimization/expertize/combinatorial-optimisation/).

<h2 id="resources">Resources</h2>

Here are some of the best resources I have found for learning constraint
programming:

- The official MiniCP MOOC channel by Professors Pascal Van Hentenryck and
  Pierre Schaus:
  [YouTube playlists](https://www.youtube.com/@minicp-mooc/playlists).
- MiniCP lectures by Professor Pierre Schaus:
  [YouTube playlist](https://www.youtube.com/playlist?list=PLq6RpCDkJMyqUQ4NWjFg2AxtYBhFeGj0R).
- *Handbook of Constraint Programming* (Foundations of Artificial Intelligence),
  edited by Francesca Rossi, Peter van Beek, and Toby Walsh:
  [book](https://www.amazon.com/exec/obidos/ASIN/0444527265/acmorg-20).
- Roman Barták's [Online Guide to Constraint Programming](https://kti.mff.cuni.cz/~bartak/constraints/).
- *The CP-SAT Primer: Using and Understanding Google OR-Tools' CP-SAT Solver*
  by Dominik Krupke:
  [online book](https://d-krupke.github.io/cpsat-primer/intro.html).
- *Principles of Constraint Programming* by Krzysztof R. Apt:
  [book preview](https://books.google.bj/books/about/Principles_of_Constraint_Programming.html?hl=fr&id=1e7Ib04fZAcC&redir_esc=y)
  — this was my 19th birthday gift, haha.
- *Modern Constraint Programming, For People Who Know SAT* by Ciaran McCreesh:
  [video](https://www.youtube.com/live/2mVMXOCSCKw?si=iTtFgpylsCu-dvyQ).
- *Logic, Optimization, and Constraint Programming: A Fruitful Collaboration*
  by John Hooker:
  [video](https://www.youtube.com/live/TknN8fCQvRk?si=N7PWrsUO8N20RKCj).
- Tools and modelling frameworks:
  [MiniCP](https://www.minicp.org/),
  [MaxiCP](https://github.com/aia-uclouvain/maxicp),
  [MiniZinc](https://www.minizinc.org/),
  [CPMpy](https://github.com/CPMpy/cpmpy), and
  [OscaR/CP](https://github.com/pschaus/oscar).
- Sequence variables in constraint programming:
  [video](https://youtu.be/vVz9REklNfs?si=XlbkPtOt3EAJt8BX).
- Global constraints:
  [Global Constraint Catalog](https://sofdem.github.io/gccat/) and
  [Global Constraints in Constraint Programming](https://www.constraint-programming.com/people/regin/papers/globalCpaior.pdf).
- Practice problems:
  [CSPLib](https://www.csplib.org/).

I will try to keep this list up to date.

## When to Use CP — and When Not To

### Use CP when the problem is easier to describe through conditions

A good sign that CP may be the right tool is that you can describe what a valid
solution must satisfy more naturally than you can describe the steps needed to
construct one.

Consider a scheduling problem: every task must start after its prerequisites,
two tasks requiring the same machine must not overlap, each employee has a
limited availability, and some operations must occur within a given time
window. These statements translate directly into constraints. The model says
*what* must hold, while the solver decides *how* to explore the possible
assignments.

CP is therefore particularly attractive when:

- decisions are discrete and interact through rich logical rules;
- the problem contains scheduling, routing, assignment, packing, or configuration constraints;
- global constraints such as `allDifferent`, `cumulative`, `noOverlap`, or `circuit` capture important structure;
- finding a feasible solution, proving infeasibility, or proving optimality matters;
- the requirements change often and the model needs to remain easy to extend.

### Be careful with very large instances

The size of an instance alone does not determine whether CP will work well. A
large model with strong constraints may be solved efficiently because
propagation removes many impossible values before search. Conversely, a
smaller model with weak constraints, large domains, or many symmetries may
produce an enormous search tree.

Plain CP can struggle when there are millions of variables, very weak
propagation, dense interactions, or strict real-time requirements. If the
problem is mostly linear and continuous, linear or mixed-integer programming
may be a better fit. Problems with a specialised structure may also benefit
more from network-flow algorithms, SAT or CP-SAT solvers, dynamic programming,
or a domain-specific heuristic.

For large-scale instances, the practical answer is often not to discard CP,
but to combine it with decomposition, symmetry breaking, redundant constraints,
large-neighbourhood search, local search, or mathematical programming. The
right question is therefore not only "How large is the instance?", but also
"How much structure can the solver exploit?"

### Learning can guide the search

One of the most interesting recent directions combines machine learning with
combinatorial search. During search, a solver repeatedly chooses a variable, a
value, a branch, or a neighbourhood to explore. These decisions have
traditionally been driven by generic or handcrafted heuristics. When many
similar instances are available, a model can instead learn which decisions tend
to lead towards good solutions.

The key idea is not necessarily to replace the solver. The learned component
guides the search towards promising regions, while the constraint solver keeps
enforcing feasibility, computing bounds, and, when the search is complete,
providing exact guarantees.

For example, [SeaPearl](https://arxiv.org/abs/2102.09193) explores reinforcement
learning for branching decisions inside a CP solver. Other work uses graph
neural networks as [global search heuristics for constraint satisfaction](https://www.ijcai.org/proceedings/2023/476),
while more recent research applies reinforcement learning to
[reduce CP search trees on scheduling problems](https://doi.org/10.1016/j.cie.2025.111413).

This hybrid approach is especially promising for recurring problem families,
where past instances provide useful training experience. It still comes with
challenges: training can be expensive, learned policies may fail to generalise
to different instances, and inference adds overhead. Learning is therefore a
guide rather than a guarantee; search and propagation remain essential.

Thanks for reading!

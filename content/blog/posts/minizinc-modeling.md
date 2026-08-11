---
title_fr: Modéliser un problème d’optimisation avec MiniZinc
title_en: Modeling an Optimisation Problem with MiniZinc
date: 2026-08-10
status: draft
---

<!--lang:fr-->
## Pourquoi MiniZinc ?

MiniZinc permet de décrire un problème d’optimisation séparément de la méthode utilisée pour le résoudre. On écrit les variables, les contraintes et l’objectif ; un solveur compatible cherche ensuite une solution.

Pour commencer, considérons un petit problème d’affectation : trois tâches doivent être attribuées à trois personnes, en minimisant le coût total.

```minizinc
int: n = 3;
set of int: PERSON = 1..n;
set of int: TASK = 1..n;

array[PERSON, TASK] of int: cost = [| 9, 2, 7,
                                      6, 4, 3,
                                      5, 8, 1 |];

% assignment[p] = tâche attribuée à la personne p
array[PERSON] of var TASK: assignment;

% Une tâche ne peut être attribuée qu'une seule fois.
constraint alldifferent(assignment);

var int: total_cost =
  sum(p in PERSON)(cost[p, assignment[p]]);

solve minimize total_cost;

output [
  "assignment = ", show(assignment),
  "\\ntotal cost = ", show(total_cost), "\\n"
];
```

La contrainte `alldifferent` exprime directement le fait que deux personnes ne peuvent pas recevoir la même tâche. Le modèle reste lisible, tandis que le solveur prend en charge la recherche.

## Première lecture du résultat

Une solution possible est `assignment = [2, 1, 3]`, avec un coût total de `9`. L’intérêt de cette approche apparaît surtout lorsque le problème grandit : on peut modifier les données ou ajouter des contraintes sans réécrire tout l’algorithme de recherche.

Mathématiquement, si $x_{p,t}$ vaut $1$ lorsque la personne $p$ reçoit la tâche $t$, la fonction objectif s’écrit :

$$
\min \quad \sum_{p=1}^{n}\sum_{t=1}^{n} c_{p,t}x_{p,t}
$$

avec les contraintes d’affectation :

$$
\sum_{t=1}^{n} x_{p,t}=1 \quad \forall p, \qquad
\sum_{p=1}^{n} x_{p,t}=1 \quad \forall t, \qquad
x_{p,t}\in\{0,1\}.
$$

Ce brouillon pourra ensuite évoluer vers un exemple de tournée de véhicules ou vers une comparaison entre programmation linéaire et programmation par contraintes.

<!--lang:en-->
## Why MiniZinc?

MiniZinc lets us describe an optimisation problem separately from the method used to solve it. We write the variables, constraints, and objective; a compatible solver then searches for a solution.

As a starting point, consider a small assignment problem: three tasks must be assigned to three people while minimising the total cost.

```minizinc
int: n = 3;
set of int: PERSON = 1..n;
set of int: TASK = 1..n;

array[PERSON, TASK] of int: cost = [| 9, 2, 7,
                                      6, 4, 3,
                                      5, 8, 1 |];

% assignment[p] = task assigned to person p
array[PERSON] of var TASK: assignment;

% A task can only be assigned once.
constraint alldifferent(assignment);

var int: total_cost =
  sum(p in PERSON)(cost[p, assignment[p]]);

solve minimize total_cost;

output [
  "assignment = ", show(assignment),
  "\\ntotal cost = ", show(total_cost), "\\n"
];
```

The `alldifferent` constraint directly expresses that two people cannot receive the same task. The model stays readable while the solver handles the search.

## Reading the first result

One possible solution is `assignment = [2, 1, 3]`, with a total cost of `9`. This approach becomes especially useful as the problem grows: we can modify the data or add constraints without rewriting the entire search algorithm.

Mathematically, if $x_{p,t}$ is $1$ when person $p$ receives task $t$, the objective function is:

$$
\min \quad \sum_{p=1}^{n}\sum_{t=1}^{n} c_{p,t}x_{p,t}
$$

with the assignment constraints:

$$
\sum_{t=1}^{n} x_{p,t}=1 \quad \forall p, \qquad
\sum_{p=1}^{n} x_{p,t}=1 \quad \forall t, \qquad
x_{p,t}\in\{0,1\}.
$$

This draft could later grow into a vehicle-routing example or a comparison between linear programming and constraint programming.

document.querySelectorAll('[data-tab-target]').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[data-tab-target]').forEach(item => item.classList.toggle('is-active', item === tab));
    document.querySelectorAll('.tab-content[data-tab-group="publication"]').forEach(panel => panel.classList.toggle('is-active', '#' + panel.id === tab.dataset.tabTarget));
  });
});

document.querySelectorAll('.update-block').forEach(block => {
  block.addEventListener('click', () => {
    document.querySelectorAll('.update-block').forEach(item => item.classList.toggle('is-active', item === block));
    document.querySelectorAll('.update-details').forEach(panel => panel.classList.toggle('is-hidden', panel.id !== 'update-details-' + block.dataset.updateId));
  });
});

document.querySelectorAll('.update-block-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    const types = trigger.dataset.targetUpdateType.split(',');
    const match = [...document.querySelectorAll('.update-block')].find(item => types.includes(item.dataset.updateType));
    match?.click();
    match?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
});

document.querySelectorAll('.research-filter-trigger').forEach(trigger => {
  trigger.addEventListener('click', () => {
    document.querySelectorAll('.carousel-item').forEach(item => item.classList.toggle('is-not-active', item.dataset.focus !== trigger.dataset.targetFocus));
    document.querySelector('.carousel-item[data-focus="' + trigger.dataset.targetFocus + '"]')?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  });
});

 document.querySelector('#toggleButton')?.addEventListener('click', event => {
  const expanded = document.querySelector('#collapsibleSection').classList.toggle('expanded');
  event.currentTarget.textContent = expanded ? 'Show less' : 'Show more';
});

import { challengesRepo } from '../repository/challenges.repo.js';

async function getChallengesList({
  page = 1,
  limit = 10,
  category,
  status,
  orderby,
}) {
  const skip = (page - 1) * limit;

  const [totalCount, list] = await challengesRepo.findChallenges({
    whereOptions: {
      ...(category && { category }),
      ...(status && { status }),
    },
    orderByOptions: orderby ? [{ [orderby]: 'desc' }] : [],
    skip,
    take: limit,
  });

  return {
    totalCount,
    list,
    page,
    limit,
  };
}

async function getMyChallenges(userId) {
  return challengesRepo.findChallengesByCreatorId(userId);
}

async function getChallengeById(challengeId) {
  return challengesRepo.findChallengeById(challengeId);
}

async function deleteChallenge(challengeId) {
  return challengesRepo.deleteChallenge(challengeId);
}

export default {
  getChallengesList,
  getMyChallenges,
  getChallengeById,
  deleteChallenge,
};
